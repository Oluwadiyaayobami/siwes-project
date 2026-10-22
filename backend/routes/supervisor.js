const express = require('express');
const { generateQR, getStats } = require('../controllers/supervisorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply middleware to all routes in this router
router.use(protect);
router.use(authorize('supervisor', 'admin'));

router.get('/generate-qr', generateQR);
router.get('/stats', getStats);

module.exports = router;
