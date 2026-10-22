const express = require('express');
const { 
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
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply base protection to all
router.use(protect);

// Lecturer routes
router.post('/create', authorize('lecturer', 'supervisor', 'admin'), createCourse);
router.get('/lecturer', authorize('lecturer', 'supervisor', 'admin'), getLecturerCourses);
router.get('/lecturer/students', authorize('lecturer', 'supervisor', 'admin'), getLecturerStudents);
router.get('/:courseId/students/:studentId', authorize('lecturer', 'supervisor', 'admin'), getStudentCourseDetails);
router.get('/:id/students', authorize('lecturer', 'supervisor', 'admin'), getCourseStudents);
router.put('/:id', authorize('lecturer', 'supervisor', 'admin'), updateCourse);
router.delete('/:id', authorize('lecturer', 'supervisor', 'admin'), deleteCourse);

// Student routes
router.post('/enroll', authorize('student'), enrollCourse);
router.get('/student', authorize('student'), getStudentCourses);
router.get('/join/:joinCode/info', authorize('student', 'lecturer', 'supervisor', 'admin'), getCourseInfoByJoinCode);

// Catch-all specific id route (must be last)
router.get('/:id', authorize('lecturer', 'supervisor', 'admin'), getCourseById);

router.post('/:id/materials', authorize('lecturer', 'admin'), addMaterial);
router.delete('/:id/materials/:materialId', authorize('lecturer', 'admin'), deleteMaterial);

module.exports = router;
