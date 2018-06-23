'use strict';
var router = require('express').Router();
var AV = require('leanengine');
var https = require('https');
var url = require('url');

router.get('/', function(req, res, next) {
	var getOption = url.parse("https://api.leancloud.cn/1.1/requestCaptcha?width=85&height=30");
	getOption.port = 443;
	getOption.method = 'GET';
	getOption.headers = {
		'X-LC-Id': process.env.LEANCLOUD_APP_ID,
		'X-LC-Key': process.env.LEANCLOUD_APP_KEY
	};
	var getReq = https.request(getOption, function(getRes) {
		var getResData = '';
		getRes.on('data', function(chunk) {
			getResData += chunk.toString();
		});
		getRes.on('end', function() {
			var resObj = JSON.parse(getResData);
			var captcha_token = !!resObj.captcha_token;
			var captcha_url = !!resObj.captcha_url;
			if (captcha_token && captcha_url)
				res.send({ status: 'success', captcha_token: resObj.captcha_token, captcha_url: resObj.captcha_url });
			else
				res.send({ status: 'fail', message: '校验码获取失败' });
		});
		getReq.on('error', function(err) {
			console.log("A6");
			console.error(err);
		});
	});
	getReq.end();
});

router.post('/verifyCaptchaCode', function(req, res, next) {
	var captchaCode = req.body.captchaCode || '';
	var captchaToken = req.body.captchaToken || '';
	var mobilePhone = req.body.mobilePhone || '';
	if (mobilePhone.length != 11) {
		res.send({ status: 'error', message: '无效的手机号码。' });
		return;
	} if (mobilePhone.length <= 0) {
		res.send({ status: 'error', message: '请填写验证码。' });
		return;
	}
	
	var postOption = url.parse("https://api.leancloud.cn/1.1/verifyCaptcha");
	postOption.port = 443;
	postOption.method = 'POST';
	postOption.headers = {
		'content-type': 'application/json;charset=utf-8',
		'X-LC-Id': process.env.LEANCLOUD_APP_ID,
		'X-LC-Key': process.env.LEANCLOUD_APP_KEY
	};
    var postReq = https.request(postOption, function(postRes) {
		var postResData = '';
		postRes.on('data', function(chunk) {
			postResData += chunk.toString();
		});
    	postRes.on('end', function() {
			var resObj = JSON.parse(postResData);
			var validateToken = resObj.validate_token || '';
			if (validateToken.length <= 0) {
				var resObjError = resObj.error || '';
				if (resObjError.length > 0)
					res.send({ status: 'fail', message: resObj.error });
				else
					res.send({ status: 'fail', message: '校验码错误。' });
				return;
			}
			var className = 'SmsCode';
			var smsCodeObjectId = '';
			var query = new AV.Query(className);
			query.equalTo('mobilePhoneNumber', mobilePhone);
			query.find().then(function (results) {
				if (results.length > 0) {
					smsCodeObjectId = results[0].id;
					var requestTime = results[0].attributes.requestTime;
					var nowTime = new Date();
					var seconds = (nowTime - requestTime) / 1000;
					if (seconds < 60) {
						res.send({ status: 'fail', message: '请勿频繁获取验证码。' });
						return;
					}
				}
				AV.Cloud.requestSmsCode({
					mobilePhoneNumber: mobilePhone,
					name: '小石头',
					op: '注册',
					ttl: 10
				}).then(function() {
					if (smsCodeObjectId.length > 0) {
						var smsCode = AV.Object.createWithoutData(className, smsCodeObjectId);
						smsCode.set('requestTime', new Date());
						smsCode.save();
					} else {
						var SmsCode = AV.Object.extend(className);
						var smsCode = new SmsCode();
						smsCode.set('mobilePhoneNumber', mobilePhone);
						smsCode.set('requestTime', new Date());		//当前时间
						smsCode.save();
					}
					res.send({ status: 'success', message: '验证码已发送。' });
				}, function(err) {
					res.send({ status: 'error', message: '[' + err.code + '] ' + err.rawMessage });
				});
			}, function (err) {
				console.log('B8');
				console.error(err);
			});
		});
	});
	postReq.on('error', function(err) {
		res.send({ status: 'fail', message: '通讯失败' });
	});
	postReq.write(JSON.stringify({
		captcha_code: captchaCode,
		captcha_token: captchaToken
	}));
	postReq.end();
});

module.exports = router;
