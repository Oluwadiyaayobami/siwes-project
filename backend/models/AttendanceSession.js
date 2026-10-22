const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide a course']
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a lecturer']
  },
  title: {
    type: String,
    trim: true,
    default: 'Lecture Attendance'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'CLOSED'],
    default: 'ACTIVE'
  },
  durationMinutes: {
    type: Number,
    default: 15
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required for geofencing']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required for geofencing']
  },
  radiusMeters: {
    type: Number,
    default: 400
  },
  otpCode: {
    type: String,
    required: true,
    index: true
  },
  attendees: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    checkedInAt: {
      type: Date,
      default: Date.now
    },
    distance: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['PRESENT', 'LATE'],
      default: 'PRESENT'
    },
    method: {
      type: String,
      enum: ['QR', 'OTP', 'MANUAL'],
      default: 'QR'
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
