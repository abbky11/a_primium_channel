const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = event.headers['x-razorpay-signature'] || event.headers['X-Razorpay-Signature'];
    if (!secret || !signature || !event.body) return { statusCode: 400, body: 'Missing webhook configuration' };
    const expected = crypto.createHmac('sha256', secret).update(event.body).digest('hex');
    const a = Buffer.from(expected); const b = Buffer.from(signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { statusCode: 400, body: 'Invalid signature' };

    const payload = JSON.parse(event.body);
    if (payload.event !== 'payment_link.paid') return { statusCode: 200, body: 'ignored' };
    const link = payload.payload?.payment_link?.entity;
    const notes = link?.notes || {};
    const userId = notes.telegram_user_id;
    if (!userId) return { statusCode: 200, body: 'No Telegram user attached' };

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    if (!token || !channelId) throw new Error('Missing Telegram environment variables');

    const inviteResponse = await fetch(`https://api.telegram.org/bot${token}/createChatInviteLink`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: channelId, member_limit: 1, creates_join_request: false, expire_date: Math.floor(Date.now() / 1000) + 86400 })
    });
    const inviteData = await inviteResponse.json();
    if (!inviteResponse.ok || !inviteData.ok || !inviteData.result?.invite_link) throw new Error('Telegram invite link creation failed');

    const chatId = notes.telegram_chat_id || userId;
    const sendResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: `आपका ₹599 का पेमेंट सफलतापूर्वक सत्यापित हो गया है।\n\nयह आपका व्यक्तिगत Telegram Channel invite link है (एक सदस्य, 24 घंटे की वैधता):\n${inviteData.result.invite_link}` })
    });
    if (!sendResponse.ok) throw new Error('Telegram message delivery failed');
    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    console.error('Razorpay webhook error:', err.message);
    return { statusCode: 500, body: 'Webhook processing failed' };
  }
};
