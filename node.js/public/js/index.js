$(document).ready(function() {
	var userId = !!$("#userId").val();
	if (userId) {
		$("#personalCenter").html('<a href="personalCenter">个人中心</a>');
	}
});
