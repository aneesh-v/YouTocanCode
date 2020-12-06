const Bootcamp = require('../Models/BootcampModel');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
   let query;

   // Copy req.query
   const reqQuery = { ...req.query };

   // Field to exclude
   const removeField = ['select', 'sort', 'page', 'limit'];

   // Loop over removeField and delete them from reqQuery
   removeField.forEach((param) => delete reqQuery[param]);

   // Create a query string
   let queryString = JSON.stringify(reqQuery);

   // Create operators like $gt, $lte etc if availabe and replacing the query string
   queryString = queryString.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
   );

   // Generating query - Search filter-1(with operators if available)
   // /api/v1/bootcamps/?averageCost[gt]=10000 etc...
   query = Bootcamp.find(JSON.parse(queryString));

   // Checking if select available in the query string
   if (req.query.select) {
      // Convert it into an arrya with spliting by ',' and join back as string
      // So etc from -> name,description to-> 'name description'
      const fields = req.query.select.split(',').join(' ');

      // Updating query - Search filter-2(fields) if available
      // /api/v1/bootcamps/?select=name,description etc...
      query = query.select(fields);
   }

   // Checking if sort available in the query string
   if (req.query.sort) {
      // See above comment
      const sortBy = req.query.sort.split(',').join(' ');

      // Updating query - Search filter-3(sorting) if available
      // /api/v1/bootcamps/?sort=name etc...
      query = query.sort(sortBy);
   } else {
      // Default sort by createdAt
      query = query.sort('-createdAt');
   }

   // Pagination
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 20;
   // startIndex value is used to skip no.of documents based on limit value and page.
   const startIndex = (page - 1) * limit;
   const endIndex = page * limit;
   const totalDocument = await Bootcamp.countDocuments();

   query = query.skip(startIndex).limit(limit);

   // Execute query
   const bootcamps = await query;

   // Pagination result
   const pagination = {};

   // Adding next page if current page is not the last one
   if (endIndex < totalDocument) {
      pagination.next = {
         page: page + 1,
         limit,
      };
   }

   // Adding next page if current page is not the first one
   if (startIndex > 0) {
      pagination.prev = {
         page: page - 1,
         limit,
      };
   }

   res.status(200).json({
      success: true,
      count: bootcamps.length,
      pagination,
      data: bootcamps,
   });
});

// @desc    Get single bootcamps
// @route   GET /api/v1/bootcamps:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
   const bootcamp = await Bootcamp.findById(req.params.id);

   // For correctly formated Id but not found in the database
   if (!bootcamp) {
      // since we have 2 response in this block of code use return to prevent error.
      return next(
         new ErrorResponse(
            `Resource not found with id of ${req.params.id}`,
            404
         )
      );
   }
   res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
   const bootcamp = await Bootcamp.create(req.body);
   res.status(201).json({
      success: true,
      data: bootcamp,
   });
});

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
   const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   });
   if (!bootcamp) {
      // since we have 2 response in this block of code use return to prevent error.
      return next(
         new ErrorResponse(
            `Bootcamp not found with id of ${req.params.id}`,
            404
         )
      );
   }
   res.status(201).json({
      success: true,
      data: bootcamp,
   });
});

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
   const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
   console.log(bootcamp);
   if (!bootcamp) {
      // since we have 2 response in this block of code use return to prevent error.
      return next(
         new ErrorResponse(
            `Bootcamp not found with id of ${req.params.id}`,
            404
         )
      );
   }

   res.status(201).json({
      success: true,
      data: {},
   });
});

// @desc    Get a bootcamp within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampByRadius = asyncHandler(async (req, res, next) => {
   const { zipcode, distance } = req.params;

   // get location from geocoder
   const loc = await geocoder.geocode(zipcode);
   const lat = loc[0].latitude;
   const lng = loc[0].longitude;

   // Calc radius using radian
   // Divide dist by radius of earth
   // Earth radius = 3,963 mi / 6,378 km
   const radius = distance / 3963;

   const bootcamps = await Bootcamp.find({
      location: {
         $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
   });

   res.status(201).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps,
   });
});
