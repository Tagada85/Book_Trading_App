const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let TradeSchema = new Schema({
	bookOneTitle: {type: String, required: true},
	bookOneOwner: {type: String, required: true},
	bookTwoTitle: {type: String, required: true},
	bookTwoOwner: {type: String, required: true} 
});

let Trade = mongoose.model('Trade', TradeSchema);

module.exports = Trade;