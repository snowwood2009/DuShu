'use strict';

var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var timeout = require('connect-timeout');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var AV = require('leanengine');

// 加载云函数定义，你可以将云函数拆分到多个文件方便管理，但需要在主文件中加载它们
require('./cloud');

var app = express();

// 设置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 设置静态文件路径
app.use(express.static('public'));

// 设置默认超时时间
app.use(timeout('15s'));

// 加载云引擎中间件
app.use(AV.express());

app.enable('trust proxy');
// 需要重定向到 HTTPS 可去除下一行的注释。
// app.use(AV.Cloud.HttpsRedirect());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
	name: 'sessionId',
	secret: 'chyingp', // 用来对session id相关的cookie进行签名
	store: new FileStore(), // 本地存储session（文本文件，也可以选择其他store，比如redis的）
	saveUninitialized: false, // 是否自动保存未初始化的会话，建议false
	resave: false, // 是否每次都重新保存会话，建议false
	//cookie: {
	//	maxAge: 10 * 1000 // 有效期，单位是毫秒
	//}
}));

app.get('/', function(req, res) {
	var userId = req.session.userId;
	if (!!userId) {
		var username = req.session.username || req.session.mobilePhone || '';
		res.render('index',	{
				currentTime: new Date(),
				userId: req.session.userId,
				username: username,
				actionUrl: '/logout',
				actionName: '注销'
		});
	} else {
		res.render('index',	{
				currentTime: new Date(),
				userId: '',
				username: '',
				actionUrl: '/login',
				actionName: '登录'
		});
	}
});

app.get('/logout', function(req, res) {
	req.session.destroy(function(err) {
		if (err) {
			res.json({ code: -2, message: '注销失败' });
		} else {
			res.clearCookie('sessionId');
			res.redirect('/');
		}
	});
});

// 可以将一类的路由单独保存在一个文件中
app.use('/captchaCode', require('./routes/captchaCode'));
app.use('/login', require('./routes/login'));
app.use('/register', require('./routes/register'));
app.use('/personalCenter', require('./routes/personalCenter'));

app.use(function(req, res, next) {
  // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器
  if (!res.headersSent) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
});

// error handlers
app.use(function(err, req, res, next) {
  if (req.timedout && req.headers.upgrade === 'websocket') {
    // 忽略 websocket 的超时
    return;
  }

  var statusCode = err.status || 500;
  if (statusCode === 500) {
    console.error(err.stack || err);
  }
  if (req.timedout) {
    console.error('请求超时: url=%s, timeout=%d, 请确认方法执行耗时很长，或没有正确的 response 回调。', req.originalUrl, err.timeout);
  }
  res.status(statusCode);
  // 默认不输出异常详情
  var error = {};
  if (app.get('env') === 'development') {
    // 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
    error = err;
  }
  res.render('error', {
    message: err.message,
    error: error
  });
});

module.exports = app;
