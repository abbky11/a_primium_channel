A PREMIUM CHANNEL – TELEGRAM + RAZORPAY STARTER

यह ZIP आपके बताए flow के लिए starter project है:
1) ग्राहक वेबसाइट से Telegram bot खोलता है और Start दबाता है।
2) Bot हर Telegram user के लिए नया ₹599 Razorpay Payment Link बनाता है।
3) ग्राहक Razorpay पर Google Pay / PhonePe / UPI से भुगतान करता है।
4) Razorpay webhook signature जाँचकर payment_link.paid event verify करता है।
5) Bot उस ग्राहक को 1-member, 24-hour invite link भेजता है।

महत्वपूर्ण: यह अभी deploy-ready नहीं है। पहले Netlify पर GitHub repository से deploy करें और नीचे दिए Environment Variables सेट करें। फिर Razorpay और Telegram webhooks configure करें। Test Mode में पूरा flow जाँचने के बाद ही Live Mode करें।

NETLIFY ENVIRONMENT VARIABLES
TELEGRAM_BOT_TOKEN       = BotFather से मिला bot token (किसी से share न करें)
TELEGRAM_WEBHOOK_SECRET  = खुद बनाया हुआ लंबा random secret (A-Z, a-z, 0-9, _ और - रखें)
TELEGRAM_CHANNEL_ID      = आपके private channel का numeric ID (आमतौर पर -100... से शुरू)
RAZORPAY_KEY_ID          = Razorpay Test Key ID
RAZORPAY_KEY_SECRET      = Razorpay Test Key Secret
RAZORPAY_WEBHOOK_SECRET  = Razorpay Dashboard में webhook बनाते समय बनाया गया secret

DEPLOY के बाद FUNCTION URL
https://YOUR-SITE.netlify.app/.netlify/functions/telegram-webhook
https://YOUR-SITE.netlify.app/.netlify/functions/razorpay-webhook

TELEGRAM WEBHOOK SETUP
Browser में यह URL खोलें (TOKEN और SECRET को अपने values से बदलें):
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://YOUR-SITE.netlify.app/.netlify/functions/telegram-webhook&secret_token=YOUR_TELEGRAM_WEBHOOK_SECRET

Razorpay Dashboard > Account & Settings > Webhooks में webhook URL यह रखें:
https://YOUR-SITE.netlify.app/.netlify/functions/razorpay-webhook
Event: payment_link.paid
Secret: वही value जो Netlify में RAZORPAY_WEBHOOK_SECRET है

GITHUB UPLOAD
1. ZIP को Extract करें।
2. GitHub पर नया repository बनाएँ (उदाहरण: apremiumchannel-bot)।
3. Extract किए गए folder के अंदर की सभी files/folders repository में upload करें। ZIP को सीधे repository में upload न करें।
4. Netlify में Add new project > Import an existing project > GitHub चुनें।
5. Repository चुनकर deploy करें। Build command खाली रखें; Publish directory '.' रखें। netlify.toml functions folder configure करता है।
6. Netlify Site configuration > Environment variables में ऊपर की सभी values जोड़ें। फिर redeploy करें।

TELEGRAM CHANNEL PERMISSIONS
Bot को channel admin रखें और Invite Users via Link / Manage Invite Links permission दें। Channel private होना चाहिए।

सुरक्षा और सीमाएँ:
- Bot token, Razorpay secret और webhook secret कभी HTML/GitHub में न डालें; केवल Netlify Environment Variables में रखें।
- पहले Razorpay Test Mode में परीक्षण करें।
- यह starter duplicate webhook deliveries के लिए persistent idempotency database नहीं जोड़ता; production launch से पहले durable event/payment tracking जोड़ना जरूरी है, ताकि Razorpay retry होने पर दो invite links न बनें।
- Razorpay payment link creation और Telegram delivery failures को Netlify function logs में जाँचें।
- इस ZIP में कोई वास्तविक secret या API key शामिल नहीं है।
