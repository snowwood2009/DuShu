$(document).ready(function() {	
	$("#btnSubmit").click(function() {
		var username = $("#edtUsername").val();
		var password = $("#edtPassword").val();
		if (username.length <= 0) {
			alert("请填写用户名。");
		} else if (password.length <= 0) {
			alert("请填写密码。");
		} else {
			$.ajax({
				type: "POST",
				url: "username",
				data: {	username: username, password: password },
				success: function(res) {
					if (res.status == 'success') {
						$(location).attr('href', '/');
					} else {
						alert(res.message);
					}
				},
				error: function(err) {
					alert("提交失败。\n" + err.statusText);
				}
			});
		}
	});
});
