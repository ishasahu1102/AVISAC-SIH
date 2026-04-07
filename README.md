<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1YCxZp-Cw-1CUwNDOQJTcaKcHyEELjpzp

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` and configure the OCR providers. Defaults already point to the free-tier
   OpenBharat (Aadhaar) and PaddleOCR (Passbook) gateways, so you only need to drop in the API keys.

```
VITE_OPENBHARAT_API_KEY=your-openbharat-key
# Optional overrides
# VITE_OPENBHARAT_OCR_ENDPOINT=https://api.openbharat.org/api/ocr/aadhaar
# VITE_OPENBHARAT_API_HEADER=x-api-key

# Passbook OCR (defaults to PaddleOCR free API)
VITE_PASSBOOK_OCR_KEY=your-passbook-key
# VITE_PASSBOOK_OCR_PROVIDER=paddle
# VITE_PASSBOOK_OCR_HEADER=x-api-key
# VITE_PADDLE_OCR_ENDPOINT=https://paddleocr-onlypassbook.onrender.com/api/passbook
# VITE_ATTESTR_OCR_ENDPOINT=https://sandbox.attestr.com/v1/ocr/passbook
```

3. Run the app:
   `npm run dev`

## Highlights

- ✅ OpenBharat + PaddleOCR integration for high-accuracy, no-cost Aadhaar and passbook scans.
- ✅ 3-page PDF export with templated backdrops that mirrors the official Annexure I journey.
- ✅ "Directly submit to bank" workflow with verified logos for every listed bank.
- ✅ Multilingual awareness screen with the updated **Start Form Filling** CTA.
