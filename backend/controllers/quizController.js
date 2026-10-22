const Quiz = require('../models/Quiz');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Lecturer
const createQuiz = async (req, res) => {
  try {
    const { title, description, course, questions, dueDate } = req.body;
    
    const quiz = await Quiz.create({
      title,
      description,
      course,
      lecturer: req.user.id,
      questions,
      dueDate
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all quizzes for a course
// @route   GET /api/quizzes/course/:courseId
// @access  Private
const getCourseQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId }).select('-questions.correctOptionIndex');
    res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createQuiz, getCourseQuizzes };
