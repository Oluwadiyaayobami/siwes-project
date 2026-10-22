const Attendance = require('../models/Attendance');
const AttendanceSession = require('../models/AttendanceSession');
const Course = require('../models/Course');
const Venue = require('../models/Venue');
const User = require('../models/User');
const { generateSessionQRToken, verifyQRToken } = require('../utils/qrToken');
const { getDistance } = require('../utils/haversine');

// @desc    Start an attendance session
// @route   POST /api/attendance/session/start
// @access  Private (Lecturer/Supervisor/Admin)
const startSession = async (req, res) => {
  try {
    const { courseId, durationMinutes = 15, latitude, longitude, radiusMeters = 100, title } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Please select a course' });
    }

    if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
      return res.status(400).json({ success: false, message: 'Lecturer classroom coordinates are required for geofencing' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify lecturer owns the course or is admin/supervisor
    if (course.lecturer.toString() !== req.user.id && req.user.role === 'lecturer') {
      return res.status(403).json({ success: false, message: 'You are not authorized to start attendance for this course' });
    }

    // Close any previous active session for this course or lecturer
    await AttendanceSession.updateMany(
      { 
        $or: [
          { course: courseId, status: 'ACTIVE' },
          { lecturer: req.user.id, status: 'ACTIVE' }
        ]
      },
      { status: 'CLOSED' }
    );

    // Generate random 6-digit OTP code for students without cameras
    let otpCode = '';
    let isUnique = false;
    while (!isUnique) {
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await AttendanceSession.findOne({ otpCode, status: 'ACTIVE' });
      if (!existing) isUnique = true;
    }

    const duration = parseInt(durationMinutes, 10) || 15;
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    const session = await AttendanceSession.create({
      course: courseId,
      lecturer: req.user.id,
      title: title && title.trim() ? title.trim() : `${course.courseCode} Attendance`,
      status: 'ACTIVE',
      durationMinutes: duration,
      startTime: new Date(),
      expiresAt,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radiusMeters: parseInt(radiusMeters, 10) || 100,
      otpCode,
      attendees: []
    });

    const qrToken = generateSessionQRToken({
      sessionId: session._id,
      courseId: course._id
    }, '30s');

    const populatedSession = await AttendanceSession.findById(session._id)
      .populate('course', 'title courseCode enrolledStudents')
      .populate('lecturer', 'name email');

    res.status(201).json({
      success: true,
      message: 'Attendance session started successfully',
      data: {
        session: populatedSession,
        qrToken,
        tokenExpiresIn: 30
      }
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get currently active session for lecturer
// @route   GET /api/attendance/session/active
// @access  Private (Lecturer/Supervisor/Admin)
const getActiveSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findOne({
      lecturer: req.user.id,
      status: 'ACTIVE'
    })
      .populate('course', 'title courseCode enrolledStudents')
      .populate('attendees.student', 'name email matricNo')
      .sort('-createdAt');

    if (!session) {
      return res.status(200).json({ success: true, data: null });
    }

    // Check if session has expired
    if (new Date() > new Date(session.expiresAt)) {
      session.status = 'CLOSED';
      await session.save();
      return res.status(200).json({ success: true, data: null, message: 'Previous session expired and was closed' });
    }

    const qrToken = generateSessionQRToken({
      sessionId: session._id,
      courseId: session.course._id
    }, '30s');

    res.status(200).json({
      success: true,
      data: {
        session,
        qrToken,
        tokenExpiresIn: 30
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refresh dynamic QR token for active session
// @route   GET /api/attendance/session/:id/refresh-token
// @access  Private (Lecturer/Supervisor/Admin)
const refreshToken = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await AttendanceSession.findById(id)
      .populate('course', 'title courseCode enrolledStudents')
      .populate('attendees.student', 'name email matricNo');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Check authorization
    if (session.lecturer.toString() !== req.user.id && req.user.role === 'lecturer') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if expired
    if (session.status === 'CLOSED' || new Date() > new Date(session.expiresAt)) {
      if (session.status !== 'CLOSED') {
        session.status = 'CLOSED';
        await session.save();
      }
      return res.status(200).json({
        success: true,
        data: {
          expired: true,
          session
        }
      });
    }

    const qrToken = generateSessionQRToken({
      sessionId: session._id,
      courseId: session.course._id
    }, '30s');

    res.status(200).json({
      success: true,
      data: {
        expired: false,
        qrToken,
        tokenExpiresIn: 30,
        session
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Close / End an attendance session
// @route   POST /api/attendance/session/:id/close
// @access  Private (Lecturer/Supervisor/Admin)
const closeSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await AttendanceSession.findById(id)
      .populate('course', 'title courseCode enrolledStudents')
      .populate('attendees.student', 'name email matricNo');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.lecturer.toString() !== req.user.id && req.user.role === 'lecturer') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    session.status = 'CLOSED';
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Attendance session closed successfully',
      data: session
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get session details with full attendance list
// @route   GET /api/attendance/session/:id
// @access  Private
const getSessionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await AttendanceSession.findById(id)
      .populate('course', 'title courseCode enrolledStudents')
      .populate('lecturer', 'name email')
      .populate('attendees.student', 'name email matricNo avatar');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all attendance sessions created by lecturer
// @route   GET /api/attendance/sessions/lecturer
// @access  Private (Lecturer/Supervisor/Admin)
const getLecturerSessions = async (req, res) => {
  try {
    const sessions = await AttendanceSession.find({ lecturer: req.user.id })
      .populate('course', 'title courseCode enrolledStudents')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manual check-in by lecturer
// @route   POST /api/attendance/session/:id/manual-mark
// @access  Private (Lecturer/Supervisor/Admin)
const manualMarkStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIdentifier } = req.body; // Can be student ID, matricNo, or email

    if (!studentIdentifier) {
      return res.status(400).json({ success: false, message: 'Please provide student ID, matric number, or email' });
    }

    const session = await AttendanceSession.findById(id).populate('course');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.lecturer.toString() !== req.user.id && req.user.role === 'lecturer') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Find student
    const student = await User.findOne({
      role: 'student',
      $or: [
        { _id: studentIdentifier.match(/^[0-9a-fA-F]{24}$/) ? studentIdentifier : null },
        { matricNo: { $regex: new RegExp(`^${studentIdentifier.trim()}$`, 'i') } },
        { email: studentIdentifier.trim().toLowerCase() }
      ]
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found with provided identifier' });
    }

    // Check if already checked in
    const alreadyPresent = session.attendees.some(a => a.student.toString() === student._id.toString());
    if (alreadyPresent) {
      return res.status(400).json({ success: false, message: `${student.name} is already marked present` });
    }

    // Auto-enroll student into course if not enrolled
    if (!session.course.enrolledStudents.includes(student._id)) {
      session.course.enrolledStudents.push(student._id);
      await session.course.save();
    }

    // Add to attendees
    session.attendees.push({
      student: student._id,
      checkedInAt: new Date(),
      distance: 0,
      status: 'PRESENT',
      method: 'MANUAL'
    });
    await session.save();

    // Create Attendance log
    await Attendance.create({
      student: student._id,
      course: session.course._id,
      session: session._id,
      status: 'PRESENT',
      method: 'MANUAL',
      distance: 0,
      coordinates: {
        latitude: session.latitude,
        longitude: session.longitude
      }
    });

    const updatedSession = await AttendanceSession.findById(id)
      .populate('course', 'title courseCode enrolledStudents')
      .populate('attendees.student', 'name email matricNo avatar');

    res.status(200).json({
      success: true,
      message: `Marked ${student.name} as present`,
      data: updatedSession
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check-in student (QR or OTP + Geofencing)
// @route   POST /api/attendance/check-in
// @access  Private (Student)
const checkIn = async (req, res) => {
  try {
    const { qrToken, otpCode, studentLat, studentLng } = req.body;

    if (!qrToken && !otpCode) {
      return res.status(400).json({ success: false, message: 'Please provide QR token or OTP code' });
    }

    if (studentLat === undefined || studentLng === undefined || studentLat === null || studentLng === null) {
      return res.status(400).json({ success: false, message: 'Location coordinates are required to verify physical presence' });
    }

    let session = null;
    let method = 'QR';

    // 1. Resolve Session by QR Token OR OTP Code
    if (qrToken) {
      const decoded = verifyQRToken(qrToken);
      if (!decoded) {
        return res.status(400).json({
          success: false,
          message: 'QR Code has expired or is invalid. Please scan the latest code on screen.'
        });
      }

      // Check if this is a legacy venue token (from supervisor)
      if (decoded.venueId) {
        const venue = await Venue.findById(decoded.venueId);
        if (!venue) {
          return res.status(404).json({ success: false, message: 'Venue not found' });
        }

        const distance = getDistance(studentLat, studentLng, venue.latitude, venue.longitude);
        let status = 'PRESENT';
        if (distance > venue.radiusMeters) {
          status = 'REJECTED_OUT_OF_BOUNDS';
        }

        // Get a default course or first enrolled course for legacy venue check-in
        const firstCourse = await Course.findOne({ enrolledStudents: req.user.id });

        const attendance = await Attendance.create({
          student: req.user.id,
          venue: venue._id,
          course: firstCourse ? firstCourse._id : null,
          status,
          method: 'QR',
          distance: Math.round(distance),
          coordinates: { latitude: studentLat, longitude: studentLng }
        });

        if (status === 'REJECTED_OUT_OF_BOUNDS') {
          return res.status(400).json({
            success: false,
            message: `You are outside the permitted area (${Math.round(distance)}m away, limit is ${venue.radiusMeters}m)`,
            distance: Math.round(distance)
          });
        }

        return res.status(201).json({
          success: true,
          message: 'Check-in successful at venue',
          data: attendance
        });
      }

      // Session-based check-in
      session = await AttendanceSession.findById(decoded.sessionId).populate('course');
      method = 'QR';
    } else if (otpCode) {
      session = await AttendanceSession.findOne({
        otpCode: otpCode.toString().trim(),
        status: 'ACTIVE'
      }).populate('course');
      method = 'OTP';
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Active attendance session not found or code is invalid'
      });
    }

    // 2. Validate Session Status & Expiration
    if (session.status !== 'ACTIVE' || new Date() > new Date(session.expiresAt)) {
      if (session.status === 'ACTIVE') {
        session.status = 'CLOSED';
        await session.save();
      }
      return res.status(400).json({
        success: false,
        message: 'This attendance session has ended'
      });
    }

    // 3. Ensure Student is Enrolled in Course
    if (!session.course.enrolledStudents.includes(req.user.id)) {
      // Auto-enroll student into this course
      session.course.enrolledStudents.push(req.user.id);
      await session.course.save();
    }

    // 4. Check for Duplicate Check-in
    const alreadyCheckedIn = session.attendees.some(
      a => a.student.toString() === req.user.id
    );

    if (alreadyCheckedIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in for this session'
      });
    }

    // 5. Geofence Verification
    const distance = getDistance(
      parseFloat(studentLat),
      parseFloat(studentLng),
      session.latitude,
      session.longitude
    );

    if (distance > session.radiusMeters) {
      // Log rejected attempt for academic integrity records
      await Attendance.create({
        student: req.user.id,
        course: session.course._id,
        session: session._id,
        status: 'REJECTED_OUT_OF_BOUNDS',
        method,
        distance: Math.round(distance),
        coordinates: { latitude: studentLat, longitude: studentLng }
      });

      return res.status(400).json({
        success: false,
        message: `Geofence check failed: You are ${Math.round(distance)}m away from the lecture hall. Maximum allowed radius is ${session.radiusMeters}m.`,
        distance: Math.round(distance),
        allowedRadius: session.radiusMeters
      });
    }

    // 6. Record Successful Attendance
    session.attendees.push({
      student: req.user.id,
      checkedInAt: new Date(),
      distance: Math.round(distance),
      status: 'PRESENT',
      method
    });
    await session.save();

    const attendanceRecord = await Attendance.create({
      student: req.user.id,
      course: session.course._id,
      session: session._id,
      status: 'PRESENT',
      method,
      distance: Math.round(distance),
      coordinates: { latitude: studentLat, longitude: studentLng }
    });

    res.status(200).json({
      success: true,
      message: 'Check-in successful! You are marked as present.',
      data: {
        courseCode: session.course.courseCode,
        courseTitle: session.course.title,
        sessionTitle: session.title,
        checkedInAt: new Date(),
        distance: Math.round(distance),
        method,
        attendanceId: attendanceRecord._id
      }
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student attendance history
// @route   GET /api/attendance/student/history
// @access  Private (Student)
const getStudentHistory = async (req, res) => {
  try {
    const history = await Attendance.find({ student: req.user.id })
      .populate('course', 'title courseCode')
      .populate('session', 'title durationMinutes createdAt')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student attendance overview and stats for a specific course
// @route   GET /api/attendance/course/:courseId/student-stats
// @access  Private (Student)
const getStudentCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Total sessions conducted for this course so far
    const totalSessions = await AttendanceSession.countDocuments({ course: courseId });

    // Student's attendance records for this course
    const records = await Attendance.find({ 
      student: studentId, 
      course: courseId 
    })
      .populate('session', 'title durationMinutes createdAt')
      .sort('-createdAt');

    const presentCount = records.filter(r => r.status === 'PRESENT').length;
    const lateCount = records.filter(r => r.status === 'LATE').length;
    
    // Absent count: sessions conducted where student was neither present nor late
    const absentCount = Math.max(0, totalSessions - (presentCount + lateCount));

    // Dynamic attendance percentage
    const percentage = totalSessions > 0 
      ? Math.round((presentCount / totalSessions) * 100) 
      : 100;

    // Check if an active attendance session is currently open for this course
    const activeSession = await AttendanceSession.findOne({ 
      course: courseId, 
      status: 'ACTIVE',
      expiresAt: { $gt: new Date() }
    });

    const isCheckedIn = activeSession 
      ? activeSession.attendees.some(a => a.student.toString() === studentId)
      : false;

    res.status(200).json({
      success: true,
      data: {
        totalSessions,
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        percentage,
        activeSession: activeSession ? {
          _id: activeSession._id,
          title: activeSession.title,
          expiresAt: activeSession.expiresAt,
          durationMinutes: activeSession.durationMinutes,
          isCheckedIn
        } : null,
        records
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  startSession,
  getActiveSession,
  refreshToken,
  closeSession,
  getSessionDetails,
  getLecturerSessions,
  manualMarkStudent,
  checkIn,
  getStudentHistory,
  getStudentCourseAttendance
};

