'use strict';
var router = require('express').Router();
var AV = require('leanengine');

router.all('/*', function(req, res, next) {
	var userId = req.session.userId;
	var isLogined = !!userId;
	if (isLogined)
		next();
	else
		res.redirect('/login');
});

router.get('/', function(req, res, next) {
	var extraInfo = {
		name: '',
		gender: 0,
		birthday: '',
		schoolName: ''
	};
	if (req.session.extraInfo != null)
		extraInfo = req.session.extraInfo;
	res.render('personalCenter', {
        username: req.session.username || '未填写',
		mobilePhone: req.session.mobilePhone || '',
		extraInfo: extraInfo
	});
});

module.exports = router;
