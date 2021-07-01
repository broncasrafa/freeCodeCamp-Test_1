require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://broncasrafa:broncasrafaAdmin@cluster0.6fgsm.mongodb.net/db_tracker?retryWrites=true&w=majority";
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