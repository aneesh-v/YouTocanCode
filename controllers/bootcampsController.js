const Bootcamp = require('../Models/BootcampModel');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
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
    // Adding current logged in user id
    req.body.user = req.user.id;

    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    // IF the user is not admin they can add only one bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `The user with ID ${req.user.id} has already published a bootcamp`,
                400
            )
        );
    }

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
    let bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        // since we have 2 response in this block of code use return to prevent error.
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                404
            )
        );
    }
    // Make suer user is bootcamp owner/creater
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User with ${req.params.id} is not authorized to update this bootcamp`,
                404
            )
        );
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(201).json({
        success: true,
        data: bootcamp,
    });
});

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    // since we are using a middleware in mongoose schema for deleting
    // courses related to bootcamps, findByIdAndDelete will not trigger.
    // so change it to findById then remove at the end.
    const bootcamp = await Bootcamp.findById(req.params.id);
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
    // Make suer user is bootcamp owner/creater
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User with ${req.params.id} is not authorized to delete this bootcamp`,
                404
            )
        );
    }

    // we use remove() because of 'remove' middleware in Bootcamp model.
    bootcamp.remove();

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

// @desc    Upload a photo to bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp with ${req.params.id} not found`, 404)
        );
    }

    // Make suer user is bootcamp owner/creater
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User with ${req.params.id} is not authorized to update this bootcamp`,
                404
            )
        );
    }

    if (!req.files) {
        return next(new ErrorResponse('Please upload a photo', 400));
    }

    const file = req.files.file;

    // Make sure file is image
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please upload an image file', 404));
    }

    // Check for file size
    if (!file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload an image less than ${
                    process.env.MAX_FILE_UPLOAD / 1000000
                } Megabyte`,
                404
            )
        );
    }

    // Create a custom file name for uploaded image
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    // mv is a methos attached to the uploaded file
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
        if (err) {
            console.log(err);
            return next(new ErrorResponse('Problem with file upload', 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, {
            photo: file.name,
        });

        res.status(200).json({
            success: true,
            data: file.name,
        });
    });
});
