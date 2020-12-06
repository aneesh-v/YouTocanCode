const express = require('express');
const {
   getBootcamps,
   getBootcamp,
   createBootcamp,
   updateBootcamp,
   deleteBootcamp,
   getBootcampByRadius,
} = require('../controllers/bootcampsController');
const router = express.Router();

router.route('/').get(getBootcamps).post(createBootcamp);
router.route('/radius/:zipcode/:distance').get(getBootcampByRadius);

router
   .route('/:id')
   .get(getBootcamp)
   .put(updateBootcamp)
   .delete(deleteBootcamp);

module.exports = router;
