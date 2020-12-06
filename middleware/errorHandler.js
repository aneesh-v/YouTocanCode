const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
   let error = { ...err };
   error.message = err.message;

   // log to Developer
   console.log(err);

   // Mongoose bad ObjectId
   if (err.name === 'CastError') {
      const message = `Resource not found with id of ${err.value}`;
      error = new ErrorResponse(message, 404);
   }

   //Mongoose document duplicate error
   if (err.code === 11000) {
      const message = 'Duplicate collection found in database.';
      error = new ErrorResponse(message, 400);
   }
   //Mongoose Validation Error
   if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map((val) => val.message);
      error = new ErrorResponse(message, 400);
   }

   res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Unidentified Server Error',
   });
};

module.exports = errorHandler;
