const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var urlTestedSchema = new Schema({
    url: String
});

module.exports = mongoose.model('UrlTested', urlTestedSchema);