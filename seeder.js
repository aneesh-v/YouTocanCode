const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const color = require('colors');

// Load Enviornmetal vars..
dotenv.config({ path: './config/config.env' });

// Load models
const Bootcamp = require('./Models/BootcampModel');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
   useNewUrlParser: true,
   useFindAndModify: false,
   useCreateIndex: true,
   useUnifiedTopology: true,
});

// Read JSON files
const bootcamps = JSON.parse(
   fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);

// Import data into DB
const importData = async () => {
   try {
      await Bootcamp.create(bootcamps);
      console.log('Data imported...'.green.inverse);
      process.exit();
   } catch (error) {
      console.error(error);
   }
};

// Delete data from DB
const deletetData = async () => {
   try {
      await Bootcamp.deleteMany();
      console.log('Data distroyed...'.red.inverse);
      process.exit();
   } catch (error) {
      console.error(error);
   }
};

if (process.argv[2] === '-i') {
   importData();
} else if (process.argv[2] === '-d') {
   deletetData();
}
