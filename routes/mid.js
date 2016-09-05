const Trade = require('../models/Trade');


exports.saveTrade = function(ownerOtherBook, my_book, other_book){
	return function(req, res, next){
		console.log(typeof my_book);
		console.log(typeof req.session.userId);
		console.log(typeof other_book);
		console.log(typeof ownerOtherBook);
		let trade = new Trade({
			bookOneTitle: my_book,
			bookOneOwner: req.session.userId,
			bookTwoTitle: other_book,
			bookTwoOwner: ownerOtherBook
		});
		trade.save();
		next();
	}
}
