const express = require('express');
const {
    register,
    login,
    logout,
    getMe,
    forgotPassword,
    resetpassword,
    updateDetails,
    changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/changepassword', protect, changePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetpassword);

module.exports = router;
