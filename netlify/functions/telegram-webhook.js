const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const received = event.headers['x-telegram-bot-api-secret-token'] || event.headers['X-Telegram-Bot-Api-Secret-Token'];
  if (!expected || received !== expected) return { statusCode: 401, body: 'Unauthorized' };

  try {
    const update = JSON.parse(event.body || '{}');
    const msg = update.message;
    const text = msg?.text || '';
    const chatId = msg?.chat?.id;
    const userId = msg?.from?.id;
    if (!chatId || !userId || !text.startsWith('/start')) return { statusCode: 200, body: 'ok' };

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!token || !keyId || !keySecret) throw new Error('Missing server environment variables');

    const referenceId = `tg${userId}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 59900, currency: 'INR', accept_partial: false,
        description: 'A Premium Channel - Trading Mastery Course',
        reference_id: referenceId,
        notes: { telegram_user_id: String(userId), telegram_chat_id: String(chatId), product: 'A Premium Channel' },
        reminder_enable: false
      })
    });
    const data = await response.json();
    if (!response.ok || !data.short_url) throw new Error(data.error?.description || 'Razorpay payment link creation failed');

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: `A Premium Channel – Trading Mastery Course\nकीमत: ₹599\n\nपेमेंट करने के लिए नीचे दिए गए लिंक पर क्लिक करें। सफल पेमेंट की पुष्टि के बाद इसी बॉट पर चैनल का invite link आएगा।\n\n${data.short_url}` })
    });
    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    console.error('Telegram webhook error:', err.message);
    return { statusCode: 200, body: 'ok' };
  }
};
