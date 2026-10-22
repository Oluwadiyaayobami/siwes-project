const { generateQRToken } = require('../utils/qrToken');
const Venue = require('../models/Venue');
const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');

// @desc    Generate temporary QR token for a venue
// @route   GET /api/supervisor/generate-qr
// @access  Private (Supervisor/Admin)
const generateQR = async (req, res) => {
  try {
    // In a real application, the supervisor would be linked to a specific venue.
    // For this prototype, we'll just use the first venue in the DB, or create a dummy one.
    let venue = await Venue.findOne();
    
    if (!venue) {
      // Create a dummy venue if none exists
      venue = await Venue.create({
        name: 'SITA Akure',
        latitude: 7.2571, // Example coordinates for Akure
        longitude: 5.2058,
        radiusMeters: 50
      });
    }

    const qrToken = generateQRToken(venue._id);

    res.status(200).json({
      success: true,
      data: {
        qrToken,
        venueName: venue.name,
        expiresIn: 30 // seconds
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance stats for the dashboard
// @route   GET /api/supervisor/stats
// @access  Private (Supervisor/Admin)
const getStats = async (req, res) => {
  try {
    // Basic aggregation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendances = await Attendance.find({ timestamp: { $gte: today } })
      .populate('student', 'name matricNo')
      .populate('venue', 'name')
      .sort('-createdAt');

    const totalStudents = await mongoose.model('User').countDocuments({ role: 'student' });
    const presentCount = attendances.filter(a => a.status === 'PRESENT').length;

    res.status(200).json({
      success: true,
      data: {
        recentActivity: attendances,
        summary: {
          present: presentCount,
          total: totalStudents,
          outOfBounds: attendances.filter(a => a.status === 'REJECTED_OUT_OF_BOUNDS').length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateQR, getStats };
