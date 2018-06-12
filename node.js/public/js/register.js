$(document).ready(function() {
	AV.Captcha.request({ width:85, height:30 }).then(function(captcha) {
		captcha.bind(
			{
				textInput:    'captchaCode',     // the id for textInput
				image:        'captchaImage',    // the id for image element
				verifyButton: 'requestSmsCode',  // the id for verify button
			},
			{
				success: function(validateCode)
				{
					var mobilePhone = $("#mobilePhone").val();
					if (mobilePhone.length != 11) {
						alert("请填写正确的手机号。");
					} else {
						$.ajax({
							type: "POST",
							url: "register/requestSmsCode",
							data: {	mobilePhone: mobilePhone },
							success: function(res) {
								alert(res.message);
							},
							error: function(err) {
								alert("获取验证码失败。\n" + err.statusText);
							}
						});
					}
				},
				error: function(err)
				{
					if ($("#captchaCode").val().length <= 0)
						alert("请填写校验码。");
					else
						alert(err.message);
				}
			}
		);
	});
	
	$("#verifySmsCode").click(function() {
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
	});
});
