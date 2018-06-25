'use strict';
var router = require('express').Router();
var AV = require('leanengine');
var https = require('https');
var url = require('url');

router.get('/', function(req, res, next) {
	var userId = req.session.userId;
	var isLogined = !!userId;
	if (!isLogined)
		res.render('register');
	else
		res.redirect('/');
});

router.post('/requestSmsCode', function(req, res, next) {
	var mobilePhone = req.body.mobilePhone || '';
	if (mobilePhone.length != 11) {
		res.send({ code: -1, message: '无效的手机号码。' });
	} else {
		AV.Cloud.requestSmsCode({
			mobilePhoneNumber: mobilePhone,
			name: '独树教育',
			op: '注册',
			ttl: 10
		}).then(function() {
			res.send({ status: 'success', code: 0, message: '验证码已发送。' });
		}, function(err) {
			res.send({ status: 'error', code: -2, message: '[' + err.code + '] ' + err.rawMessage });
		});
	}
});

router.post('/verifySmsCode', function(req, res, next) {
	var mobilePhone = req.body.mobilePhone || '';
	var smsCode = req.body.smsCode || '';
	if (mobilePhone.length != 11) {
		res.send({ status: 'error', code: -1, message: '无效的手机号码。' });
	} if (smsCode.length <= 0) {
		res.send({ status: 'error', code: -3, message: '请填写验证码。' });
	} else {
		var postOption = url.parse("https://pineadww.api.lncld.net/1.1/usersByMobilePhone");
		postOption.port = 443;
		postOption.method = 'POST';
		postOption.headers = {
            'Content-Type' : 'application/json',
			'X-LC-Id': process.env.LEANCLOUD_APP_ID,
			'X-LC-Key': process.env.LEANCLOUD_APP_KEY
		};

		var postReq = https.request(postOption, function(postRes) {
			var postResData = '';
			postRes.on('data', function(chunk) {
				postResData += chunk.toString();
			});
			postRes.on('end', function() {
				var resObj = JSON.parse(postResData.toString());
				var sessionToken = resObj.sessionToken || '';
				if (sessionToken.length > 0) {
					req.session.regenerate(function(err) {
						if (err) {
							console.error(err);
							res.send({ status: 'error', code: 0, message: '会话失败' });
						} else {
							req.session.userId = resObj.objectId;
							req.session.mobilePhone = mobilePhone;
							var user = AV.Object.createWithoutData('_User', resObj.objectId);
							user.fetch().then(function(user) {
								req.session.username = user.get('displayUsername');
								var extraInfo = user.get('extraInfo');
								if (!extraInfo) {
									var UserExtra = AV.Object.extend('UserExtra');
									var extra = new UserExtra();
									extra.set('name', '');
									extra.set('birthday', new Date('1901-01-01'));
									extra.set('gender', 0);
									extra.set('schoolName', '');
									extra.save().then(function(extra) {
										user.set('extraInfo', extra);
										user.save();
									});
								}
								res.send({ status: 'success', code: 0, message: '验证成功' });
							}, function(err) {
								console.log("H5");
								console.error(err);
								res.send({ status: 'success', code: 0, message: '验证成功' });
							});
						}
					});
				} else {
					res.send({ status: 'fail', code: resObj.code, message: resObj.error });
				}
			});
		});
		postReq.on('error', function(err) {
			res.send({ status: 'fail', code: -1, message: '通讯失败' });
		});

		postReq.write(JSON.stringify({
			mobilePhoneNumber: mobilePhone,
			smsCode: smsCode
		}));
		postReq.end();
	}
});

router.all('/*', function(req, res, next) {
	var userId = req.session.userId;
	var isLogined = !!userId;
	if (isLogined)
		next();
	else
		res.redirect('/register');
});

router.get('/username', function(req, res, next) {
	var query = new AV.Query('_User');
	query.get(req.session.userId).then(function(user) {
		var username = user.get('username');
		var mobilePhone = user.get('mobilePhoneNumber');
		if (!username || username == mobilePhone) {
			res.render('username');
		} else {
			res.redirect('/');
		}
	}, function(err) {
		req.redirect('/');
	});
});

router.post('/username', function(req, res, next) {
	var username = req.body.username || '';
	var password = req.body.password || '';
	if (username.length <= 0) {
		res.send({ status: 'error', code: -1, message: '用户名不能为空。' });
		return;
	}
	var pattern = /^[a-z,A-Z][a-z,A-Z,0-9]{2,19}$/;
	var matchResult = username.match(pattern) || '';
	if (matchResult.length <= 0) {
		res.send({ status: 'error', code: -3, message: '用户名格式错误。' });
		return;
	}
	if (password.length <= 0) {
		res.send({ status: 'error', code: -3, message: '密码不能为空。' });
		return;
	}

	var user = AV.Object.createWithoutData('_User', req.session.userId);
	user.fetch().then(function() {
		user.set('displayUsername', username);
		user.set('username', username.toLowerCase());
		user.set('password', password);
		user.save().then(function(ret) {
			req.session.username = username;
			res.send({ status: 'success', code: 0, message: '提交完成。' });
		}, function(err) {
			if (err.code == 202)
				res.send({ status: 'fail', code: -5, message: '用户名' + username + '已被占用，请使用其它用户名。' });
			else
				res.send({ status: 'fail', code: -5, message: '提交失败。' });
		});
	}, function(err) {
		console.error('c2');
		console.error(err);
		res.send({ status: 'fail', code: -5, message: '没有找到用户。' });
	});
});

module.exports = router;
