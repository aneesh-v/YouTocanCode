//Load env vars
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Route files
const bootcamps = require('./Routes/bootcamps');
const courses = require('./Routes/courses');
const auth = require('./Routes/auth');
const users = require('./Routes/users');
const reviews = require('./Routes/review');

const errorHanlder = require('./middleware/errorHandler');
const fileUpload = require('express-fileupload');

// Security packages
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const crossSite = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const app = express();

// Connect to DB
connectDB();

// Body parser
app.use(express.json());
// Cookie parser
app.use(cookieParser());

// Dev logging middlewre
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// File uploading
app.use(fileUpload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attack
app.use(crossSite());

// Rate limit
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10Min
    max: 100,
});
app.use(limiter);

// Enable CORS - Cross-origin resource sharing
// allows restricted resources on a web page to be requested from another domain
app.use(cors());

// Prevent http params polution
app.use(hpp());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth/', auth);
app.use('/api/v1/users/', users);
app.use('/api/v1/reviews/', reviews);

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
