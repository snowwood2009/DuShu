'use strict';
var router = require('express').Router();
var AV = require('leanengine');

router.all('/*', function(req, res, next) {
	var userId = req.session.userId;
	var isLogined = !!userId;
	if (!isLogined)
		next();
	else
		res.redirect('/');
});

router.get('/', function(req, res, next) {
	res.render('login');
});

router.post('/loginWithPwd', function(req, res, next) {
	var username = req.body.username || '';
	var password = req.body.password || '';
	if (username.length <= 0 || password <= 0) {
		console.log("B3");
		res.send({ status: 'fail', message: '用户名或密码错误。' });
		return;
	}
	AV.User.logIn(username, password).then(function (loggedInUser) {
		req.session.regenerate(function(err) {
			if (err) {
				console.error(err);
				res.send({ status: 'error', message: '登录失败' });
			} else {
				req.session.userId = loggedInUser.id;
				req.session.username = username;
				req.session.mobilePhone = loggedInUser.mobilePhone || '';
				res.send({ status: 'success', message: '登录成功。' });
			}
		});
	}, function (err) {
		console.error(err);
		res.send({ status: 'fail', message: '用户名或密码错误。' });
	});
});

module.exports = router;
