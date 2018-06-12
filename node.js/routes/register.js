'use strict';
var router = require('express').Router();
var AV = require('leanengine');
var https = require('https');
var url = require('url');

//var Todo = AV.Object.extend('Todo');

router.get('/', function(req, res, next) {
/*
  var query = new AV.Query(Todo);
  query.descending('createdAt');
  query.find().then(function(results) {
    res.render('todos', {
      title: 'TODO 列表',
      todos: results
    });
  }, function(err) {
    if (err.code === 101) {
      // 该错误的信息为：{ code: 101, message: 'Class or object doesn\'t exists.' }，说明 Todo 数据表还未创建，所以返回空的 Todo 列表。
      // 具体的错误代码详见：https://leancloud.cn/docs/error_code.html
      res.render('todos', {
        title: 'TODO 列表',
        todos: []
      });
    } else {
      next(err);
    }
  }).catch(next);
 */
    res.render('register');
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
			console.log('a2');
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
		res.send({ code: -1, message: '无效的手机号码。' });
	} if (smsCode.length <= 0) {
		res.send({ code: -3, message: '请填写验证码。' });
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
            postRes.on('data', function(data) {
				var resObj = JSON.parse(data.toString());
				var sessionToken = resObj.sessionToken || '';
				if (sessionToken.length > 0) {
					req.session.regenerate(function(err) {
						if (err) {
							console.error(err);
							res.send({ status: 'error', code: 0, message: '会话失败' });
						} else {
							req.session.loginUser = mobilePhone;
							resObj.status = 'success';
							resObj.code = 0;
							res.send(resObj);
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

		var reqData = '{"mobilePhoneNumber":"' + mobilePhone + '","smsCode":"' + smsCode + '"}';

		postReq.write(reqData);
		postReq.end();
	}
});

router.get('/logout', function(req, res, next) {
	req.session.destroy(function(err) {
		if (err) {
			res.json({ code: -2, message: '注销失败' });
		} else {
			res.clearCookie('sessionId');
			res.redirect('/register');
		}
	});
});

router.get('/username', function(req, res, next) {
	var loginUser = req.session.loginUser;
	var isLogined = !!loginUser;
	console.log(loginUser);
	console.log(isLogined);
	if (isLogined)
		res.render('username');
	else
		res.redirect('/register');
});

module.exports = router;
