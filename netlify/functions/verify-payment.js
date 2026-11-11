const crypto = require('crypto');

function safeHexEqual(expectedHex, receivedHex) {
  if (typeof receivedHex !== 'string' || !/^[a-f0-9]{64}$/i.test(receivedHex)) return false;
  const expected = Buffer.from(expectedHex, 'hex');
  const received = Buffer.from(receivedHex, 'hex');
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Allow': 'POST' }, body: 'Method Not Allowed' };
  }

  try {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (_) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Payment details सही format में नहीं हैं।' })
      };
    }

    const orderId = body.razorpay_order_id;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;
    if (typeof orderId !== 'string' || typeof paymentId !== 'string' ||
        !/^order_[A-Za-z0-9]+$/.test(orderId) ||
        !/^pay_[A-Za-z0-9]+$/.test(paymentId) ||
        typeof signature !== 'string') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Payment details अधूरे या गलत हैं।' })
      };
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error('Razorpay keys are not configured');

    // First verify Razorpay's checkout signature on the server.
    const expectedSignature = crypto.createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    if (!safeHexEqual(expectedSignature, signature)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Payment signature सही नहीं है।' })
      };
    }

    // Then independently fetch both records from Razorpay and confirm amount,
    // currency, order association, capture and paid status.
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const requestOptions = { headers: { Authorization: `Basic ${auth}` } };
    const [paymentResponse, orderResponse] = await Promise.all([
      fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, requestOptions),
      fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, requestOptions)
    ]);

    const [payment, order] = await Promise.all([
      paymentResponse.json(),
      orderResponse.json()
    ]);

    const valid =
      paymentResponse.ok && orderResponse.ok &&
      payment.id === paymentId &&
      payment.order_id === orderId &&
      order.id === orderId &&
      Number(payment.amount) === 39900 &&
      Number(order.amount) === 39900 &&
      payment.currency === 'INR' &&
      order.currency === 'INR' &&
      payment.status === 'captured' &&
      order.status === 'paid' &&
      order.notes?.product === 'Premium Channel';

    if (!valid) {
      return {
        statusCode: 402,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verified: false,
          error: '₹399 का captured और paid Razorpay order verify नहीं हुआ।'
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({
        verified: true,
        telegramUrl: 'https://t.me/+PmatplC2WqwxMzBl',
        message: 'Payment verified. Premium Channel access link is ready.'
      })
    };
  } catch (error) {
    console.error('Verify payment error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: false, error: 'Payment verification में server समस्या आई।' })
    };
  }
};
        
