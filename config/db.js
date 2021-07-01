require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const uri = "";
// 

const connectDB = async () => {
    try {
        
        await mongoose.connect(uri, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        console.log('MongoDB connected......');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;