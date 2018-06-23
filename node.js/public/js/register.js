function requestCaptchaCode() {
	$.ajax({
		type: "GET",
		url: "captchaCode/",
		success: function(res) {
			if ('success' == res.status) {
				$("#captchaImage").attr("src", res.captcha_url);
				$("#captchaToken").attr("value", res.captcha_token);
			} else {
				alert(res.message);
			}
		},
		error: function(err) {
			alert("校验码获取失败。\n" + err.statusText);
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

function verifySmsCode() {
	var mobilePhone = $("#mobilePhone").val();
	var smsCode = $("#smsCode").val();
	if (mobilePhone.length != 11) {
		alert("请填写正确的手机号。");
	} else if (smsCode.length <= 0) {
		alert("请填写验证码。");
	} else {
		$.ajax({
			type: "POST",
			url: "register/verifySmsCode",
			data: {	mobilePhone: mobilePhone, smsCode: smsCode },
			success: function(res) {
				if (res.status == 'success') {
					$(location).attr('href', 'register/username');
				} else {
					alert(res.message);
				}
			},
			error: function(err) {
				alert("注册失败。\n" + err.statusText);
			}
		});
	}
}

$(document).ready(function() {
	$("#captchaImage").click(requestCaptchaCode);
	$("#requestSmsCode").click(verifyCaptchaCode);
	$("#verifySmsCode").click(verifySmsCode);
	requestCaptchaCode();
});
