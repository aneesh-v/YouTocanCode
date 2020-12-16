const express = require('express');
const {
    createUser,
    deleteUser,
    updateUser,
    getUsers,
    getUser,
} = require('../controllers/usersController');
// Middleware for advanced search results
const advancedResults = require('../middleware/advancedResult');
// protect middleware
const { protect, authorize } = require('../middleware/auth');
const User = require('../Models/UserModel');
const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(advancedResults(User), getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
