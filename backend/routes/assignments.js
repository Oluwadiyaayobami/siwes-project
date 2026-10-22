const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const { protect, authorize } = require('../middleware/auth');
const Course = require('../models/Course');

router.use(protect);

// @desc    Get all assignments for a course
// @route   GET /api/assignments/course/:courseId
router.get('/course/:courseId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId }).populate('lecturer', 'name').populate('course', 'title courseCode enrolledStudents').lean();
    
    // Attach submission counts
    for (let assignment of assignments) {
      const submissionCount = await Submission.countDocuments({ assignment: assignment._id });
      assignment.submissionsCount = submissionCount;
    }

    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get all assignments for the currently logged in lecturer
// @route   GET /api/assignments/lecturer
// @access  Lecturer only
router.get('/lecturer', authorize('lecturer', 'admin', 'supervisor'), async (req, res) => {
  try {
    const courses = await Course.find({ lecturer: req.user.id });
    const courseIds = courses.map(c => c._id);
    const assignments = await Assignment.find({ course: { $in: courseIds } }).populate('course', 'title courseCode enrolledStudents').lean();
    
    // Attach submission counts
    for (let assignment of assignments) {
      const submissionCount = await Submission.countDocuments({ assignment: assignment._id });
      assignment.submissionsCount = submissionCount;
    }

    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get all assignments for the currently logged in student
// @route   GET /api/assignments/student
// @access  Student only
router.get('/student', authorize('student'), async (req, res) => {
  try {
    const courses = await Course.find({ enrolledStudents: req.user.id });
    const courseIds = courses.map(c => c._id);
    const assignments = await Assignment.find({ course: { $in: courseIds } }).populate('course', 'title courseCode').lean();
    
    // Attach submission status
    for (let assignment of assignments) {
      const submission = await Submission.findOne({ assignment: assignment._id, student: req.user.id }).lean();
      if (submission) {
        assignment.status = submission.status || 'Submitted';
        assignment.score = submission.grade;
      } else {
        assignment.status = 'Pending';
      }
    }

    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Lecturer only
router.post('/', authorize('lecturer', 'admin', 'supervisor'), async (req, res) => {
  try {
    req.body.lecturer = req.user.id;
    const assignment = await Assignment.create(req.body);
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get a single assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title courseCode')
      .populate('lecturer', 'name email');
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    // Check if student has submitted
    let submission = null;
    if (req.user.role === 'student') {
      submission = await Submission.findOne({ assignment: req.params.id, student: req.user.id });
    }
    
    res.status(200).json({ 
      success: true, 
      data: {
        ...assignment.toObject(),
        submission
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Submit an assignment (student)
// @route   POST /api/assignments/:id/submit
// @access  Student only
router.post('/:id/submit', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const submissionData = {
      ...req.body,
      assignment: req.params.id
    };

    // Determine if late
    if (new Date() > assignment.dueDate) {
      submissionData.status = 'Late Submission';
    }

    const submission = await Submission.create(submissionData);
    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Lecturer only
router.get('/:id/submissions', async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id }).populate('student', 'name email');
    res.status(200).json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Grade a submission
// @route   PUT /api/assignments/submissions/:submissionId/grade
// @access  Lecturer only
router.put('/submissions/:submissionId/grade', async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { grade, feedback, status: 'Graded' },
      { new: true, runValidators: true }
    );
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
