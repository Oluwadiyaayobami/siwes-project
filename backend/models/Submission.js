const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileUrl: {
    type: String,
    required: true, // student must upload a file
  },
  status: {
    type: String,
    enum: ['Submitted', 'Late Submission', 'Graded'],
    default: 'Submitted'
  },
  grade: {
    type: String, // e.g., '95/100'
  },
  feedback: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema);
