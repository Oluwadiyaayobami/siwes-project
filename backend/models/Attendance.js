const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttendanceSession'
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue'
  },
  status: {
    type: String,
    enum: ['PRESENT', 'REJECTED_OUT_OF_BOUNDS', 'EXPIRED_QR', 'LATE'],
    required: true
  },
  method: {
    type: String,
    enum: ['QR', 'OTP', 'MANUAL'],
    default: 'QR'
  },
  distance: {
    type: Number
  },
  coordinates: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Attendance', attendanceSchema);
