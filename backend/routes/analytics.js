const express = require('express');
const { getLecturerAnalytics, getStudentAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/lecturer', authorize('supervisor', 'admin', 'lecturer'), getLecturerAnalytics);
router.get('/student', authorize('student'), getStudentAnalytics);

module.exports = router;
