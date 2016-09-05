const assert = require('assert');
const bcrypt = require('bcrypt');

describe('Hash Passwords', function(){
	const User = require('../models/User');
	it('should return a correct salt', function(){
		bcrypt.genSalt(12, (err, salt)=>{
			assert(salt.length == 12);
		});
	});

	it('should compare plain and hased password', function(){
		let user = new User({
			username: 'Damien',
			password: 'secret',
		});
		bcrypt.genSalt(12, (err, salt)=>{
			user.salt = salt;
			bcrypt.hash(user.password, salt, (err, hash)=>{
				user.password = hash;
				user.save();
			});
		});

		User.find({ username: 'Damien'}, (err, user)=>{
			console.log(user.salt);
			bcrypt.hash('secret', user.salt, (err, hash)=>{
				assert(hash === user.password);
			});
		});
	});
});