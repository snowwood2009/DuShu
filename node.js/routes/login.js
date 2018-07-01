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

function loadExtraAndResponse(req, res, extraInfo, username)
{
	if (extraInfo != null && extraInfo.id != null) {
		var query = new AV.Query('UserExtra');
		query.get(extraInfo.id).then(function (extraInfo) {
			req.session.extraInfo = extraInfo.attributes;
			res.send({ status: 'success', message: '登录成功。', username: username });
		}, function (err) {
			res.send({ status: 'success', message: '登录成功。', username: username });
		});
	} else {
		res.send({ status: 'success', message: '登录成功。', username: username });
	}
}

router.post('/loginWithPwd', function(req, res, next) {
	var username = req.body.username || '';
	var password = req.body.password || '';
	if (username.length <= 0 || password <= 0) {
		res.send({ status: 'fail', message: '用户名和密码不能为空。' });
		return;
	}
	AV.User.logIn(username.toLowerCase(), password).then(function (loggedInUser) {
		req.session.regenerate(function(err) {
			if (err) {
				console.log("***************B4");
				console.error(err);
				res.send({ status: 'error', message: '登录失败' });
			} else {
				console.log(loggedInUser);
				req.session.userId = loggedInUser.id;
				req.session.username = loggedInUser.attributes.displayUsername;
				req.session.mobilePhone = loggedInUser.attributes.mobilePhoneNumber || '';
				loadExtraAndResponse(req, res, loggedInUser.attributes.extraInfo);
			}
		});
	}, function (err) {
		if (err.code == 211)
			res.send({ status: 'fail', message: '用户名或密码错误。' });
		else
			res.send({ status: 'fail', message: err.rawMessage });
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
							req.session.username = results[0].attributes.displayUsername;
							req.session.mobilePhone = mobilePhone;
							loadExtraAndResponse(req, res,
									results[0].attributes.extraInfo,
									req.session.username);
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
