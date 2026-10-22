const Course = require('../models/Course');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const AttendanceSession = require('../models/AttendanceSession');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Generate 12-char alphanumeric code
const generateJoinCode = () => {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
};

// @desc    Create a new course
// @route   POST /api/courses/create
// @access  Private (Supervisor/Lecturer)
const createCourse = async (req, res) => {
  try {
    const { title, courseCode, schedule } = req.body;

    if (!title || !courseCode || !schedule) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    let joinCode;
    let isUnique = false;

    // Ensure joinCode uniqueness
    while (!isUnique) {
      joinCode = generateJoinCode();
      const existing = await Course.findOne({ joinCode });
      if (!existing) {
        isUnique = true;
      }
    }

    const course = await Course.create({
      title,
      courseCode,
      lecturer: req.user.id,
      schedule,
      joinCode,
      enrolledStudents: []
    });

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get courses created by lecturer
// @route   GET /api/courses/lecturer
// @access  Private (Supervisor/Lecturer)
const getLecturerCourses = async (req, res) => {
  try {
    const courses = await Course.find({ lecturer: req.user.id }).sort('-createdAt');
    
    // Add student count to response
    const coursesWithCount = courses.map(course => ({
      ...course.toObject(),
      studentCount: course.enrolledStudents.length
    }));

    res.status(200).json({
      success: true,
      data: coursesWithCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/enroll
// @access  Private (Student)
const enrollCourse = async (req, res) => {
  try {
    const { joinCode } = req.body;

    if (!joinCode) {
      return res.status(400).json({ success: false, message: 'Please provide a join code' });
    }

    const course = await Course.findOne({ joinCode: joinCode.toUpperCase() });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Invalid join code or course not found' });
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course' });
    }

    course.enrolledStudents.push(req.user.id);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: course
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get courses student is enrolled in
// @route   GET /api/courses/student
// @access  Private (Student)
const getStudentCourses = async (req, res) => {
  try {
    const courses = await Course.find({ enrolledStudents: req.user.id })
      .populate('lecturer', 'name email')
      .select('-enrolledStudents')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all students across all courses for the lecturer
// @route   GET /api/courses/lecturer/students
// @access  Private (Lecturer)
const getLecturerStudents = async (req, res) => {
  try {
    const courses = await Course.find({ lecturer: req.user.id }).populate('enrolledStudents', 'name email _id avatar matricNo');
    
    // Extract unique students and associate them with courses
    const studentMap = new Map();
    
    for (let course of courses) {
      // Real count of sessions conducted for this course
      const totalCourseSessions = await AttendanceSession.countDocuments({ course: course._id });

      for (let student of course.enrolledStudents) {
        if (!studentMap.has(student._id.toString())) {
          
          const presentCount = await Attendance.countDocuments({ 
            student: student._id, 
            course: course._id,
            status: 'PRESENT'
          });
          
          // Attendance rate logic:
          // If 1 class held & student attended 1 -> 1/1 = 100%
          // If 2 classes held & student missed 1 -> 1/2 = 50%
          // If 10 classes held & student attended 9 -> 9/10 = 90%
          // If no classes held yet -> 100% (clean slate)
          const attendancePercentage = totalCourseSessions > 0
            ? Math.round((presentCount / totalCourseSessions) * 100)
            : 100;
          
          let status = "Poor";
          if (attendancePercentage >= 75) status = "Excellent";
          else if (attendancePercentage >= 50) status = "Average";

          studentMap.set(student._id.toString(), {
            ...student.toObject(),
            course: course.courseCode,
            courseId: course._id,
            attendance: Math.min(attendancePercentage, 100),
            totalSessions: totalCourseSessions,
            presentCount,
            status
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: Array.from(studentMap.values())
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific student details for a course
// @route   GET /api/courses/:courseId/students/:studentId
// @access  Private (Lecturer/Admin)
const getStudentCourseDetails = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    
    if (course.lecturer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const student = await mongoose.model('User').findById(studentId).select('-password');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Get attendance records
    const attendances = await Attendance.find({ student: studentId, course: courseId })
      .populate('session', 'title durationMinutes createdAt')
      .populate('venue', 'name')
      .sort('-createdAt');
      
    // Count real sessions conducted for this course
    const totalSessions = await AttendanceSession.countDocuments({ course: courseId });
    const presentCount = attendances.filter(a => a.status === 'PRESENT').length;
    
    // Calculate dynamic attendance rate:
    // If no classes held yet -> 100%
    // If 1 class held & attended -> 1/1 = 100%
    // If 2 classes held & 1 missed -> 1/2 = 50%
    // If 10 classes held & 9 attended -> 9/10 = 90%
    const attendancePercentage = totalSessions > 0
      ? Math.round((presentCount / totalSessions) * 100)
      : 100;
    
    // Get assignments and submissions
    const assignments = await mongoose.model('Assignment').find({ course: courseId }).lean();
    const submissions = await mongoose.model('Submission').find({ student: studentId, assignment: { $in: assignments.map(a => a._id) } }).lean();

    const assignmentsWithSubmissions = assignments.map(a => {
      const sub = submissions.find(s => s.assignment.toString() === a._id.toString());
      return {
        ...a,
        submission: sub || null
      };
    });

    res.status(200).json({
      success: true,
      data: {
        student,
        course,
        attendance: {
          records: attendances,
          presentCount,
          totalSessions,
          percentage: attendancePercentage
        },
        assignments: assignmentsWithSubmissions
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single course by ID
// @route   GET /api/courses/:id
// @access  Private (Lecturer/Supervisor/Admin)
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Check if user is lecturer of this course
    if (course.lecturer.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'supervisor') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this course' });
    }

    res.status(200).json({
      success: true,
      data: {
        ...course.toObject(),
        studentCount: course.enrolledStudents.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get paginated and searchable students in a course
// @route   GET /api/courses/:id/students
// @access  Private (Supervisor/Lecturer)
const getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const { search = '', page = 1, limit = 20 } = req.query;
    
    // Convert to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Base query for students in the course
    let query = { _id: { $in: course.enrolledStudents } };

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { matricNo: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .select('name email matricNo')
      .skip(skip)
      .limit(limitNum)
      .sort('name');

    const totalStudents = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: students.length,
      pagination: {
        total: totalStudents,
        page: pageNum,
        pages: Math.ceil(totalStudents / limitNum)
      },
      data: students
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get course info by join code
// @route   GET /api/courses/join/:joinCode/info
// @access  Private (Student)
const getCourseInfoByJoinCode = async (req, res) => {
  try {
    const { joinCode } = req.params;
    const course = await Course.findOne({ joinCode: joinCode.toUpperCase() }).populate('lecturer', 'name');
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Invalid join code or course not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: course._id,
        title: course.title,
        courseCode: course.courseCode,
        lecturer: course.lecturer,
        schedule: course.schedule
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Lecturer)
const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Make sure user is course owner
    if (course.lecturer.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this course' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Lecturer)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Make sure user is course owner
    if (course.lecturer.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this course' });
    }

    await course.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add material to course
// @route   POST /api/courses/:id/materials
// @access  Private (Lecturer/Admin)
const addMaterial = async (req, res) => {
  try {
    const { title, fileUrl } = req.body;
    
    if (!title || !fileUrl) {
      return res.status(400).json({ success: false, message: 'Title and fileUrl are required' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.lecturer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to modify this course' });
    }

    course.materials.push({ title, fileUrl });
    await course.save();

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete material from course
// @route   DELETE /api/courses/:id/materials/:materialId
// @access  Private (Lecturer/Admin)
const deleteMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.lecturer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to modify this course' });
    }

    // Filter out the material by id
    course.materials = course.materials.filter(
      (mat) => mat._id.toString() !== req.params.materialId
    );
    
    await course.save();

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCourse,
  getLecturerCourses,
  enrollCourse,
  getStudentCourses,
  getCourseStudents,
  updateCourse,
  deleteCourse,
  getLecturerStudents,
  getCourseById,
  getCourseInfoByJoinCode,
  addMaterial,
  deleteMaterial,
  getStudentCourseDetails
};
