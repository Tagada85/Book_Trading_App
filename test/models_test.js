const assert = require('assert');

describe('Book model', function(){
	const Book = require('../models/Book');
	it('should be empty', function(){
		Book.find({title: 'random title'}, (err, docs)=>{
			assert(docs.count == 0);
		});
	});

	it('should return an object', function(){
		Book.find({}, (err, docs)=>{
			assert(typeof docs === 'object');
		});
	});

	it('should save a book', function(){
		let myBook = new Book({
			title: 'title',
			author: 'author'
		});
		myBook.save();
		Book.find({}, (err, docs)=>{
			assert(docs.count == 1);
		})
	})

	it('should delete a book', function(){
		let myBook = new Book({
			title: 'hello world',
			author: 'Me'
		});

		myBook.save();
		myBook.remove();
		Book.find({title: 'hello world'}, (err, docs)=>{
			assert(docs.count == 0);
		});
	});

	it('should update a book', function(){
		let myBook = new Book({
			title: 'hello world',
			author: 'Me'
		});

		myBook.save();
		Book.findOneAndUpdate(
			{title: 'hello world'},
			{author: 'Peter Crouch'},
			(err, doc)=>{
				assert(doc.author === 'Peter Crouch')
			}
		)
	});
});

describe('User model', function(){
	const User = require('../models/User');
	it('should be empty', function(){
		User.find({}, (err, docs)=>{
			assert(docs.count == 0);
		});
	});

	it('should return an object', function(){
		User.find({}, (err, docs)=>{
			assert(typeof docs === 'object');
		})
	});

	it('should save a user', function(){
		let user = new User({
			username: 'userOne',
			password: 'secret'
		});
		user.save();
		User.find({}, (err, docs)=>{
			assert(docs.count == 1);
		});
	});

	it('should not save user if no password', function(){
		let userNoPass = new User({
			username: 'userTwo'
		});
		userNoPass.save();
		User.find({username: 'userTwo'}, (err, docs)=>{
			assert(docs.count == 0);
		});
	});

	it('should not save user if no username', function(){
		let userNoName = new User({
			password: 'mySecret'
		});
		userNoName.save();
		User.find({password: 'mySecret'}, (err, docs)=>{
			assert(docs.count == 0);
		});
	});

	it('should delete a user', function(){
		let user = new User({
			username: 'userThree',
			password: 'shhhh'
		});

		user.save();
		user.remove();
		User.find({username: 'userThree'}, (err, docs)=>{
			assert(docs.count == 0);
		});
	});

	it('should not register user if username is already taken', function(){
		let userOne = new User({
			username: 'userFour',
			password: 'hey'
		});
		let userTwo = new User({
			username : 'userFour',
			password : 'hey'
		});

		userOne.save();
		userTwo.save();

		User.find({}, (err, docs)=>{
			assert(docs.count == 1);
		});
	})
});

describe('Trade Model', function(){
	const Trade = require('../models/Trade');
	it('should return empty object', function(){
		Trade.find({}, (err, docs)=>{
			assert(docs.count == 0);
		});
	});

	it('should return an object', function(){
		Trade.find({}, (err, docs)=>{
			assert(typeof docs === 'object');
		});
	});

	describe('Saving Trade Model', function(){
		beforeEach(function(){
			let trade = new Trade({
				book_one_title : 'one Book',
				book_one_owner: 'ownerOne',
				book_two_title: 'two book',
				book_two_owner: 'ownerTwo'
			});
			trade.save();
		});

		it('should save an trade object', function(){
			Trade.find({}, (err, docs)=>{
				assert(docs.count == 1);
			});
		});

		it('should have four properties', function(){
			Trade.find({book_one_title: 'one Book'}, (err, doc)=>{
				assert(doc.length ==  4);
			});
		});

	});

	describe('Not saving Trade Model', function(){
		before(function(){
			let trade = new Trade({
				book_one_title : 'one Book',
				book_two_title: 'two book',
				book_two_owner: 'ownerTwo'
			});
			trade.save();
		});

		it('should not be saved', function(){
			Trade.find({}, (err, docs)=>{
				assert(docs.count == 0);
			});
		});
	});
})
