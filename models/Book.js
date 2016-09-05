const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let BookSchema = new Schema({
	title: {type: String, required: true},
	author: String,
	image_cover: String,
	owner_username: {type:String, required: true}
});

let Book = mongoose.model('Book', BookSchema);

module.exports = Book;