var express = require('express');
var router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User');
const Trade = require('../models/Trade');
const bcrypt = require('bcrypt');
const saveTrade = require('./mid').saveTrade;


/* GET home page. */
router.get('/', function(req, res, next) {
	Book.find({}, (err, books)=>{
		if(err) return next(err);
  		res.render('index', { title: 'Book Trading', books: books, userId: req.session.userId });	
	});
});

/* GET new book page */
router.get('/new_book', (req, res, next)=>{
	if(!req.session.userId){
		const err = new Error('You need to be logged in to see this page');
		err.status = 401;
		return next(err);
	}
	res.render('new_book', {title: 'Add a book', userId: req.session.userId});
});

router.get('/trades', (req,res,next)=>{
	let promise = getBooks();
	promise.then((books)=>{
		User.findOne({username: req.session.userId}, (err, user)=>{
			if(err) return next(err);
			res.render('trades', { title: 'Trades', userId: req.session.userId, books: books, userInfo: user});
		})
	})

});

/* GET login page */
router.get('/login', (req, res, next)=>{
	res.render('login',{title: 'Login Page'});
});

router.get('/profile', (req, res, next)=>{
	if(!req.session){
		const error = new Error('you must be logged in to see your profile');
		error.status =  503;
		return next(error);
	}else{
		User.findOne({username: req.session.userId}, (err, user)=>{
			if(err) return next(err);
			res.render('profile', {title: 'Profile', info: user, userId: req.session.userId});
		});
	}
})

/* GET signup page */
router.get('/signup', (req, res, next)=>{
	res.render('signup', {title: 'Signup Page'});
});

router.get('/logout', (req, res, next)=>{
	if(req.session){
		req.session.destroy((err)=>{
			if(err) return next(err);
			res.redirect('/');
		});
	}
});

/* POST new book */
router.post('/new_book', (req, res, next)=>{
	let title = req.body.title;
	let author = req.body.author;
	let image_url = req.body.cover_image;

	let newBook = new Book({
		title: title,
		author: author,
		image_cover: image_url,
		owner_username: req.session.userId
	});

	newBook.save();
	User.findOne({username: req.session.userId},(err, user)=>{
		if(err) return next(err);
		user.booksOwned.push({title: title});
		user.save();
		res.redirect('/');
	});
});

/* POST new user */
router.post('/signup',  (req, res, next)=>{
	let username = req.body.username;
	let pass = req.body.password;


	bcrypt.genSalt(12, (err, salt)=>{
		if(err) return next(err);
		let user = new User({
			username: username,
			password: pass,
			salt: salt
		});
		bcrypt.hash(user.password, salt, (err, hash)=>{
			if(err) return next(err);
			user.password = hash;
			user.save();
			req.session.userId = user.username;
			res.redirect('/');
		});
	});
});

router.post('/login', (req, res, next)=>{
	let username = req.body.username;
	let password = req.body.password;

	User.findOne({username: username}, (err, user)=>{
		if(!user || err){
			const error = new Error('Wrong username');
			error.status = 401;
			return next(error);
		}else{
			let salt = user.salt;
			bcrypt.hash(password, salt, (err, hash)=>{
				if(err) return next(err);
				if(hash == user.password){
					req.session.userId = user.username;
					res.redirect('/');
				}else{
					const error = new Error('Wrong password');
					error.status = 401;
					return next(error);
				}
			});
		}
	});
});

router.post('/profile', (req, res, next)=>{
	let city = req.body.city;
	let fullName = req.body.fullName;
	let state = req.body.state;
	User.findOneAndUpdate({username: req.session.userId},
	{
		city: city,
		fullName: fullName,
		state: state	
	}, (err, done)=>{
		if(err) return next(err);
		res.redirect('/profile');
	});
});

router.post('/trades', (req,res, next)=>{
	let my_book = req.body.my_book;
	let other_book = req.body.other_book;
	let promise = getUsername(other_book);
	promise.then((otherUser)=>{
		otherUser.trades.push({
			bookOneTitle: my_book,
			bookOneOwner: req.session.userId,
			bookTwoTitle: other_book,
			bookTwoOwner: otherUser.username
		});
		otherUser.save();
		User.findOne({username: req.session.userId}, (err, user)=>{
			if(err) return next(err);
			user.trades.push({
				bookOneTitle: my_book,
				bookOneOwner: req.session.userId,
				bookTwoTitle: other_book,
				bookTwoOwner: otherUser.username
			});
			user.save();
		});
		res.redirect('/profile');
	});
});

router.post('/tradeForm', (req, res, next)=>{
	let answer = req.body.answer;
	let otherUser = req.body.bookOneOwner;
	let myBookTitle = req.body.bookTwoTitle;
	let otherBookTitle = req.body.bookOneTitle;

	if(!answer){
		const err = new Error('You need to accept or decline the trade!');
		err.status = 401;
		return next(err);
	}else if(answer == 'yes'){
		Book.findOne({title: myBookTitle}, (err, book)=>{
			if(err) return next(err);
			book.owner_username = otherUser;
			book.save();
		});
		Book.findOne({title: otherBookTitle}, (err, book)=>{
			if(err) return next(err);
			book.owner_username = req.session.userId;
			book.save();
		});
		User.findOne({username: req.session.userId}, (err, user)=>{
			if(err) return next(err);
			user.booksOwned.map((book, i)=>{
				if(book.title == myBookTitle){
					user.booksOwned.splice(i, 1);
				}
			});
			user.booksOwned.push({title: otherBookTitle});
			user.trades.map((trade, i)=>{
				if(trade.bookOneTitle == otherBookTitle){
					user.trades.splice(i, 1);
				}
			});
			user.save();
		});
		User.findOne({username: otherUser}, (err, user)=>{
			if(err) return next(err);
			user.booksOwned.push({title: myBookTitle});
			user.booksOwned.map((book, i)=>{
				if(book.title == otherBookTitle){
					user.booksOwned.splice(i, 1);
				}
			});
			user.trades.map((trade, i)=>{
				if(trade.bookOneTitle == otherBookTitle){
					user.trades.splice(i, 1);
				}
			});

			user.save();
		});
		res.redirect('/trades');

	}else if(answer == 'no'){
		User.findOne({username: req.session.userId}, (err, user)=>{
			if(err) return next(err);
			user.trades.map((trade, i)=>{
				if(trade.bookOneTitle == otherBookTitle){
					user.trades.splice(i, 1);
				}
			});
			user.save();
		});
		User.findOne({username: otherUser}, (err, user)=>{
			if(err) return next(err);
			user.trades.map((trade, i)=>{
				if(trade.bookOneTitle == myBookTitle){
					user.trades.splice(i, 0);
				}
			});
			user.save();
		});
		res.redirect('/trades');
	}
});

function getUsername(book){
	let promise = User.findOne({'booksOwned.title': book}).exec();
	return promise;
}

function getBooks(){
	let promise = Book.find({}).exec();
	return promise;
}

module.exports = router;
