const mongoose = require('mongoose');
const indexConfig = require('./index');

const connectDB = async () => {
  try {
    console.log(indexConfig.MONGO_URI);
    const mongoURI = process.env.MONGODB_URI;
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

