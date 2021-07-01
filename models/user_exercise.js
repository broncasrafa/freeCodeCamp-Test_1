const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var validate = require('mongoose-validator');

// var descriptionValidator = [
//   validate({
//     validator: 'isLength',
//     arguments: [15],
//     message: 'description too long'
//   });
// ];

const userExerciseSchema = new Schema({
    username: String,
    date: { type: Date, default: Date.now },
    duration: { type: Number, required: true },
    description: { type: String, required: true, maxlength: 15 }
}, { versionKey: false });

module.exports = mongoose.model('UserExercise', userExerciseSchema);