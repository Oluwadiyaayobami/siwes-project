const express = require('express');
const { createQuiz, getCourseQuizzes } = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('supervisor', 'admin'), createQuiz);
router.get('/course/:courseId', getCourseQuizzes);

module.exports = router;
