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

router.post('/loginWithPhone', function(req, res, next) {
	var mobilePhone = req.body.mobilePhone || '';
	var smsCode = req.body.smsCode || '';
	if (mobilePhone.length != 11) {
		res.send({ status: 'error', code: -1, message: '无效的手机号码。' });
	} if (smsCode.length <= 0) {
		res.send({ status: 'error', code: -3, message: '请填写验证码。' });
	} else {
		AV.Cloud.verifySmsCode(smsCode, mobilePhone).then(function(){
			req.session.regenerate(function(err) {
				if (err) {
					console.error(err);
					res.send({ status: 'error', message: '登录失败' });
				} else {
					var query = new AV.Query('_User');
					query.equalTo('mobilePhoneNumber', mobilePhone);
					query.find().then(function (results) {
						if (results.length <= 0) {
							res.send({ status: 'fail', message: '此手机号未注册。' });
						} else {
							req.session.userId = results[0].id;
							req.session.username = results[0].attributes.username;
							req.session.mobilePhone = mobilePhone;
							res.send({ status: 'success', message: '登录成功。' });
						}
					}, function (error) {
						console.log('A14');
						console.error(error);
					});
				}
			});
		}, function(err){
			res.send({ status: 'fail', message: err.rawMessage || '验证码错误' });
		});
	}
});

module.exports = router;
