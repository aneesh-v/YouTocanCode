//Load env vars
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

const express = require('express');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');
const bootcamps = require('./Routes/bootcamps');
const errorHanlder = require('./middleware/errorHandler');
const app = express();

// Connect to DB
connectDB();

// Body parser
app.use(express.json());

// Dev logging middlewre
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/bootcamps', bootcamps);
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
