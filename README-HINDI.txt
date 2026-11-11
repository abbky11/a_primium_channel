PREMIUM CHANNEL – UPDATED NETLIFY + RAZORPAY PROJECT

इस संस्करण में:
- Website name: Premium Channel
- Price: ₹399 (frontend और backend दोनों)
- Currency: INR
- Theme: Black + Neon Purple + Neon Blue
- Razorpay order backend function: netlify/functions/create-order.js
- Server-side signature + Razorpay payment/order status verification:
  netlify/functions/verify-payment.js
- Payment verify होने के बाद ही Direct Telegram Join button दिखता है।
- Common Telegram channel link:
  https://t.me/+PmatplC2WqwxMzBl
- Telegram Bot, Bot Token, Telegram webhook, token-based purchase link,
  per-user invite generation और पुराने Razorpay-to-Telegram webhook को हटा दिया गया है।

NETLIFY ENVIRONMENT VARIABLES

केवल ये दो variables आवश्यक हैं:

RAZORPAY_KEY_ID      = Razorpay TEST या LIVE Key ID
RAZORPAY_KEY_SECRET  = उसी mode का Razorpay Key Secret

महत्वपूर्ण:
- Key ID और Key Secret एक ही mode (TEST या LIVE) के होने चाहिए।
- Razorpay Key Secret केवल Netlify Environment Variables में रखें।
- कोई भी Razorpay secret HTML, JavaScript frontend या GitHub repository में न डालें।
- इस ZIP में कोई वास्तविक secret key शामिल नहीं है।
- Environment variables बदलने के बाद Netlify पर नया deploy/redeploy करें।

NETLIFY DEPLOY

1. ZIP Extract करें।
2. Extract किए गए a_primium_channel_updated folder के अंदर की files और folders
   अपने Netlify से जुड़े GitHub repository/project root में रखें।
3. सुनिश्चित करें कि index.html और netlify.toml project root में हों।
4. Netlify में Site configuration > Environment variables खोलें।
5. RAZORPAY_KEY_ID और RAZORPAY_KEY_SECRET सेट/जाँचें।
6. Deploys में जाकर नया deploy करें।
7. Deploy पूरा होने के बाद website खोलकर TEST MODE में जाँचें।

PAYMENT FLOW

1. ग्राहक website खोलता है।
2. BUY NOW — ₹399 दबाने पर create-order function Razorpay में ₹399 का INR order बनाता है।
3. Razorpay Checkout payment पूरा करता है।
4. Checkout response की signature server पर verify होती है।
5. Server Razorpay API से payment और order दोनों fetch करता है।
6. Server amount ₹399, INR currency, सही order association, captured payment
   और paid order status जाँचता है।
7. सभी जाँच सफल होने पर ही server Telegram URL लौटाता है।
8. Frontend तब JOIN TELEGRAM CHANNEL बटन दिखाता है।

TESTING CHECKLIST

- पहले Razorpay TEST MODE credentials लगाएँ।
- ₹399 का test payment करें।
- Success के बाद verify-payment function का response verified=true होना चाहिए।
- गलत signature या failed/uncaptured payment पर Join button नहीं दिखना चाहिए।
- ₹399 के अलावा किसी amount वाले order पर Join button नहीं दिखना चाहिए।
- Razorpay Dashboard में payment captured और order paid जाँचें।
- सफल TEST MODE के बाद ही सही LIVE credentials configure करें।

महत्वपूर्ण सीमाएँ और सुरक्षा जानकारी

- Telegram invite link एक common, shareable link है। कोई भी व्यक्ति जिसे यह link मिल जाए,
  वह इसे आगे share कर सकता है। इस common link में per-customer access control नहीं है।
- वेबसाइट पर Join button केवल server-side verified payment के बाद दिखाई देता है।
  लेकिन common invite link सार्वजनिक रूप से share हो जाने पर Telegram स्वयं उस link से
  आने वाले व्यक्ति का payment status नहीं जान सकता।
- यह project payment records का persistent database नहीं रखता। Payment dispute,
  customer support, refunds और order history के लिए अलग record-keeping व्यवस्था रखें।
- Live payment से पहले Razorpay account की eligibility, business details, product/service
  policies और लागू कानूनों की जाँच account holder को करनी चाहिए।
