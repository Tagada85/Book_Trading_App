const mongoose = require('mongoose');
let Schema = mongoose.Schema;
const Trade = require('./Trade');

let UserSchema = new Schema({
	fullName: String,
	city: String,
	state: String,
	username: { type: String, required: true, unique: true},
	booksOwned: [{title: String}],
	password: {type: String, required: true},
	salt: String,
	trades: [{bookOneTitle: String,
	bookOneOwner: String,
	bookTwoTitle: String,
	bookTwoOwner: String }]
});


let User = mongoose.model('User', UserSchema);

module.exports = User;