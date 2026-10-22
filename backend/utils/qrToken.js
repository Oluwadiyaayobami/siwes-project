const jwt = require('jsonwebtoken');

// Generate JWT for User Auth
const generateAuthToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate Short-lived QR Token for Venue (Legacy supervisor support)
const generateQRToken = (venueId) => {
  return jwt.sign({ venueId, type: 'qr_attendance' }, process.env.JWT_SECRET, {
    expiresIn: '30s', 
  });
};

// Generate Dynamic QR Token for Lecturer Attendance Session
const generateSessionQRToken = (sessionData, expiresIn = '30s') => {
  return jwt.sign(
    { 
      sessionId: sessionData.sessionId, 
      courseId: sessionData.courseId, 
      nonce: Math.random().toString(36).substring(2, 9),
      type: 'session_attendance' 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn }
  );
};

// Universal QR token verifier
const verifyQRToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'qr_attendance' && decoded.type !== 'session_attendance') return null;
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = { 
  generateAuthToken, 
  generateQRToken, 
  generateSessionQRToken, 
  verifyQRToken 
};
