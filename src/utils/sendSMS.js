const axios = require('axios');

const sendSMS = async (mobileNumber, message) => {
  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: "q",
        sender_id: "FSTSMS",
        message: message,
        language: "english",
        numbers: mobileNumber
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error("FULL SMS ERROR:", error.response?.data || error.message);
    throw new Error("Failed to send SMS");
  }
};

module.exports = sendSMS;