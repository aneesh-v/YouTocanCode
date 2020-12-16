const express = require('express');
const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampByRadius,
    bootcampPhotoUpload,
} = require('../controllers/bootcampsController');

const Bootcamp = require('../Models/BootcampModel');

// Middleware for advanced search results
const advancedResults = require('../middleware/advancedResult');

// Includes other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./review');

// protect middleware
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Re-routing to resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);
router.route('/radius/:zipcode/:distance').get(getBootcampByRadius);

router
    .route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router
    .route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

module.exports = router;
