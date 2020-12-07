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

const router = express.Router();

// Re-routing to resource routers
router.use('/:bootcampId/courses', courseRouter);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(createBootcamp);
router.route('/radius/:zipcode/:distance').get(getBootcampByRadius);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route('/:id/photo').put(bootcampPhotoUpload);

module.exports = router;
