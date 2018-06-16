function onPwdLogin() {
  var username = $("#username").val();
  var password = $("#password").val();
  if (username.length == 0) {
    alert("请填写用户名。")
    return;
  }
  if (password.length == 0) {
    alert("请填写密码。")
    return;
  }
	$.ajax({
		type: "POST",
		url: "login/loginWithPwd",
		data: {
			username: username,
			password: password
		},
		success: function(res) {
			if ('success' == res.status) {
        $(location).attr('href', '/');
			} else {
				alert(res.message);
			}
		},
		error: function(err) {
			alert("登录失败\n" + err.statusText);
		}
	});
}

function onPhoneLogin() {

}

$(document).ready(function() {
  $("#usePwd").click(function () {
    $("#divPwd").show();
    $("#divPhone").hide();
  });
  $("#usePhone").click(function () {
    $("#divPwd").hide();
    $("#divPhone").show();
  });
  $("#btnPwdLogin").click(onPwdLogin);
  $("#btnPhoneLogin").click(onPhoneLogin);
});
