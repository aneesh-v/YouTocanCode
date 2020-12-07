//Load env vars
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');
const bootcamps = require('./Routes/bootcamps');
const courses = require('./Routes/courses');
const errorHanlder = require('./middleware/errorHandler');
const fileUpload = require('express-fileupload');
const app = express();

// Connect to DB
connectDB();

// Body parser
app.use(express.json());

// Dev logging middlewre
if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'));
}

// File uploading
app.use(fileUpload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

app.use(errorHanlder);

const PORT = process.env.PORT || 5000;

const server = app.listen(
   PORT,
   console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
         .brightYellow
   )
);

// Handle unhandledRejections
process.on('unhandledRejection', (err, promise) => {
   console.log(`Error: ${err.message}`.red);
   // Close server and exit
   server.close(() => process.exit(1));
});
