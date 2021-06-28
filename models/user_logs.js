const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserExercise = require('./user_exercise');

const userExerciseSchema = new Schema({    
    date: { type: String },
    duration: { type: Number },
    description: { type: String }
});

const userLogsSchema = new Schema({
    username: String,
    count: Number,
    log: [userExerciseSchema]
}, { versionKey: false });

module.exports = mongoose.model('UserLogs', userLogsSchema);