const express = require('express');
const {
    getReviews,
    getReview,
    addReview,
    updateReview,
    deleteReview,
} = require('../controllers/reviewController');

// Middleware for advanced search results
const advancedResults = require('../middleware/advancedResult');
const Review = require('../Models/ReviewModel');
// protect middleware
const { protect, authorize } = require('../middleware/auth');
const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(
        advancedResults(Review, {
            path: 'bootcamp',
            select: 'name description',
        }),
        getReviews
    )
    .post(protect, authorize('user', 'admin'), addReview);
router
    .route('/:id')
    .get(getReview)
    .put(protect, authorize('user', 'admin'), updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
