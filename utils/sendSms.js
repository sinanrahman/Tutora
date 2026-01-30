const axios = require('axios');

exports.sendSms = async (phone, otp) => {
  try {
	console.log(process.env.FAST2SMS_API_KEY)
	console.log(phone)
	console.log(otp)
	
	await axios.get(`https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=otp&variables_values=${otp}&numbers=${phone}&flash=0`)
    // const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
    //   params: {
    //     route: 'otp',
    //     variables_values: otp,
    //     numbers: phone,
    //   },
    //   headers: {
    //     authorization: process.env.FAST2SMS_API_KEY, // lowercase, exact key
    //     'Content-Type': 'application/json',
    //   },
    // });
	
    // if (!response.data.return) {
    //   console.error('Fast2SMS API returned error:', response.data);
    //   throw new Error('Failed to send OTP via SMS');
    // }
	
    // return response.data;
  } catch (error) {
    console.error('Fast2SMS Error:', error.response?.data || error.message);
    throw new Error('Failed to send OTP via SMS');
  }
};

