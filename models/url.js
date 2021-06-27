const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlSchema = new Schema({
    originalUrl: String,
    shortUrl: String,
    longUrl: String
});

module.exports = mongoose.model('Url', urlSchema);