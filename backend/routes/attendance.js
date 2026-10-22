const express = require('express');
const {
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
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Lecturer / Admin attendance session routes
router.post('/session/start', protect, authorize('lecturer', 'supervisor', 'admin'), startSession);
router.get('/session/active', protect, authorize('lecturer', 'supervisor', 'admin'), getActiveSession);
router.get('/session/:id/refresh-token', protect, authorize('lecturer', 'supervisor', 'admin'), refreshToken);
router.post('/session/:id/close', protect, authorize('lecturer', 'supervisor', 'admin'), closeSession);
router.get('/session/:id', protect, getSessionDetails);
router.get('/sessions/lecturer', protect, authorize('lecturer', 'supervisor', 'admin'), getLecturerSessions);
router.post('/session/:id/manual-mark', protect, authorize('lecturer', 'supervisor', 'admin'), manualMarkStudent);

// Student check-in & history
router.post('/check-in', protect, checkIn);
router.get('/student/history', protect, authorize('student'), getStudentHistory);
router.get('/course/:courseId/student-stats', protect, getStudentCourseAttendance);

module.exports = router;

