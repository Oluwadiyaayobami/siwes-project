const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a venue name']
  },
  latitude: {
    type: Number,
    required: [true, 'Please add latitude']
  },
  longitude: {
    type: Number,
    required: [true, 'Please add longitude']
  },
  radiusMeters: {
    type: Number,
    default: 50
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Venue', venueSchema);
