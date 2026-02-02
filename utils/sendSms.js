const axios = require('axios');

exports.sendSms = async (phone, otp) => {
	try {
		const message = `Your login OTP is ${otp}`;
		await axios.get(
			`https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=q&message=${encodeURIComponent(message)}&numbers=${phone}&flash=0`
		);
	} catch (error) {
		console.error('Fast2SMS Error:', error.response?.data || error.message);
		throw new Error('Failed to send OTP via SMS');
	}
};