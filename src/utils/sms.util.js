const axios = require('axios');

// MSG91 configuration
const msg91Config = {
  authKey: process.env.MSG91_AUTH_KEY,
  senderId: process.env.MSG91_SENDER_ID || 'MSGIND', // Default sender for testing
  country: process.env.MSG91_COUNTRY || '91', // India
  isEnabled: process.env.SMS_ENABLED === 'true'
};

/**
 * Send SMS using MSG91 API (without template)
 * @param {string} phone - Phone number with or without country code
 * @param {string} message - SMS message content
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendSMS = async (phone, message) => {
  try {
    // Check if SMS is enabled
    if (!msg91Config.isEnabled) {
      console.log(`SMS disabled. Message for ${phone}: ${message}`);
      return { success: true, messageId: 'SMS_DISABLED' };
    }

    // Validate configuration
    if (!msg91Config.authKey) {
      throw new Error('MSG91 auth key not configured');
    }

    // Format phone number - keep it simple for Indian numbers
    let formattedPhone = phone.trim();
    
    // If phone already has +91, keep it as is
    // If phone starts with 91 (without +), add +
    // If phone is just 10 digits, add +91
    if (formattedPhone.startsWith('+91')) {
      // Already in correct format
      formattedPhone = formattedPhone;
    } else if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
      // Has 91 but no +
      formattedPhone = '+' + formattedPhone;
    } else if (formattedPhone.length === 10) {
      // Just 10 digit Indian number
      formattedPhone = '+91' + formattedPhone;
    } else if (formattedPhone.startsWith('0') && formattedPhone.length === 11) {
      // Remove leading 0 and add +91
      formattedPhone = '+91' + formattedPhone.substring(1);
    }

    // MSG91 Simple SMS API
    const url = 'https://api.msg91.com/api/sendhttp.php';
    
    const params = {
      authkey: msg91Config.authKey,
      mobiles: formattedPhone,
      message: message,
      sender: msg91Config.senderId,
      route: '4', // 4 for transactional route
      country: '91' // India
    };

    console.log(`Sending SMS to ${formattedPhone} via MSG91...`);

    const response = await axios.get(url, {
      params: params,
      timeout: 10000
    });

    // MSG91 returns a string response, check if it contains error
    const responseData = response.data.toString();
    
    if (responseData.includes('error')) {
      throw new Error(responseData);
    }

    console.log('SMS sent successfully via MSG91');
    console.log('Response:', responseData);
    
    return {
      success: true,
      messageId: responseData || 'MSG91_SUCCESS',
      sentTo: formattedPhone
    };

  } catch (error) {
    // Log error details
    console.error('SMS sending failed:', {
      phone,
      error: error.response?.data || error.message,
      status: error.response?.status
    });

    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Test MSG91 balance
const checkBalance = async () => {
  try {
    if (!msg91Config.authKey) {
      throw new Error('MSG91 auth key not configured');
    }

    const url = 'https://api.msg91.com/api/balance.php';
    const response = await axios.get(url, {
      params: {
        authkey: msg91Config.authKey,
        type: '4' // SMS balance
      }
    });
    
    console.log('MSG91 SMS Balance:', response.data);
    return {
      success: true,
      balance: response.data
    };
  } catch (error) {
    console.error('Failed to check MSG91 balance:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test SMS sending
const testSMS = async (testPhone) => {
  try {
    const testMessage = 'Test SMS from SALAH app. If you received this, SMS service is working correctly.';
    const result = await sendSMS(testPhone || '+911234567890', testMessage);
    
    return result;
  } catch (error) {
    console.error('SMS test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendSMS,
  checkBalance,
  testSMS
};