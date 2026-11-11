const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Allow': 'POST' }, body: 'Method Not Allowed' };
  }

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error('Razorpay keys are not configured');

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 39900,
        currency: 'INR',
        receipt: `premium-${crypto.randomBytes(8).toString('hex')}`,
        notes: { product: 'Premium Channel' }
      })
    });
    const data = await response.json();

    if (!response.ok || !data.id || Number(data.amount) !== 39900 || data.currency !== 'INR') {
      console.error('Razorpay order creation failed:', data.error?.description || 'invalid order response');
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Razorpay order नहीं बन पाया। कृपया बाद में कोशिश करें।' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({
        key: keyId,
        orderId: data.id,
        amount: data.amount,
        currency: data.currency
      })
    };
  } catch (error) {
    console.error('Create order error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server configuration में समस्या है। Netlify function logs देखें।' })
    };
  }
};
