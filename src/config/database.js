

const mongoose = require('mongoose');


const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const conn = await mongoose.connect('mongodb+srv://sugixinfo_db_user:xQfjSiVESQbX2tQW@cluster0.n2zfxxj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
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

