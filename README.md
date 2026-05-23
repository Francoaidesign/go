# FRANCO Design Studio - Gemini API Version

## ارفع هذه الملفات على GitHub بهذا الشكل

index.html
package.json
vercel.json
README.md
api/generate-image.js

## بعد Import من Vercel

أضف متغير البيئة:

Name:
GEMINI_API_KEY

Value:
مفتاح Google AI Studio API

ثم اعمل Redeploy.

## ملاحظات
- لا تضع GEMINI_API_KEY داخل index.html.
- المفتاح يوضع فقط في Vercel Environment Variables.
- الملف api/generate-image.js هو الباك إند الآمن.
