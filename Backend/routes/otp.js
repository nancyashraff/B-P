const express = require('express');
const router  = express.Router();
const { requestOTP, verifyOTPAndOrder } = require('../controllers/otpController');

router.post('/request', requestOTP);
router.post('/verify',  verifyOTPAndOrder);

module.exports = router;