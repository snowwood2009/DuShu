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

function requestCaptchaCode() {
	$.ajax({
		type: "GET",
		url: "captchaCode/",
		success: function(res) {
			if ('success' == res.status) {
				$("#captchaImage").attr("src", res.captcha_url);
				$("#captchaToken").attr("value", res.captcha_token);
			}
		},
		error: function(err) {
		}
	});
}

function verifyCaptchaCode() {
	var captchaCode = $("#captchaCode").val();
	if (captchaCode.length <= 0) {
		alert("请填写校验码！")
		return;
	}
	var mobilePhone = $("#mobilePhone").val();
	if (mobilePhone.length != 11) {
		alert("请填写正确的手机号码！")
		return;
	}
	var captchaToken = $("#captchaToken").val();
	$.ajax({
		type: "POST",
		url: "captchaCode/verifyCaptchaCode",
		data: {
			captchaCode: captchaCode,
			captchaToken: captchaToken,
			mobilePhone: mobilePhone
		},
		success: function(res) {
			if ('success' == res.status) {
			} else {
				alert(res.message);
				requestCaptchaCode();
			}
		},
		error: function(err) {
			alert("校验码验证失败。\n" + err.statusText);
		}
	});
}

function onPhoneLogin() {
	var mobilePhone = $("#mobilePhone").val();
	var smsCode = $("#smsCode").val();
	if (mobilePhone.length != 11) {
		alert("请填写正确的手机号。");
	} else if (smsCode.length <= 0) {
		alert("请填写验证码。");
	} else {
		$.ajax({
			type: "POST",
			url: "login/loginWithPhone",
			data: {	mobilePhone: mobilePhone, smsCode: smsCode },
			success: function(res) {
				if (res.status == 'success') {
					$(location).attr('href', '/');
				} else {
					alert(res.message);
				}
			},
			error: function(err) {
				alert("登录失败。\n" + err.statusText);
			}
		});
	}
}

$(document).ready(function() {
	$("#usePwd").click(function () {
		$("#usePwd").css("background-color", "#48bf48");
		$("#usePwd").css("color", "white");
		$("#usePhone").css("background-color", "white");
		$("#usePhone").css("color", "black");	
		$("#divPwd").show();
		$("#divPhone").hide();
	});
	$("#usePhone").click(function () {
		$("#usePwd").css("background-color", "white");
		$("#usePwd").css("color", "black");	
		$("#usePhone").css("background-color", "#48bf48");
		$("#usePhone").css("color", "white");
		$("#divPwd").hide();
		$("#divPhone").show();
	});
	$("#btnPwdLogin").click(onPwdLogin);
	
	$("#captchaImage").click(requestCaptchaCode);
	$("#requestSmsCode").click(verifyCaptchaCode);
	$("#btnPhoneLogin").click(onPhoneLogin);

	requestCaptchaCode();
});
