'use strict';
var router = require('express').Router();

router.all('/*', function(req, res, next) {
	var userId = req.session.userId;
	var isLogined = !!userId;
	if (isLogined)
		next();
	else
		res.redirect('/login');
});

router.get('/', function(req, res, next) {
	res.render('personalCenter');
});

module.exports = router;
