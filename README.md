# Cartoon Video Bundle — Netlify + Razorpay Test Integration

## Included
- `index.html`: product page with Razorpay Standard Checkout.
- `netlify/functions/create-order.mjs`: creates a ₹99 INR Razorpay order server-side.
- `netlify/functions/verify-payment.mjs`: verifies Checkout signature and independently checks the Razorpay payment is captured for ₹99 INR before returning the delivery URL.
- `netlify.toml`: Netlify build and Functions configuration.

## Deploy
Upload/commit the contents of this folder to the root of the existing GitHub repository, replacing the old `index.html` and adding the `netlify/` folder and `netlify.toml`. Netlify should automatically deploy the new commit.

## Add Netlify environment variables
In Netlify: Site configuration (or Project configuration) → Environment variables. Add these values for the deployed site:
- `RAZORPAY_KEY_ID` = your TEST Key ID
- `RAZORPAY_KEY_SECRET` = your TEST Key Secret
- `DELIVERY_URL` = your Google Drive delivery URL

Do not put the Key Secret in GitHub, HTML, or a public message. Use Test Mode credentials only for this test deployment. After adding or changing variables, trigger a new deploy so Functions receive them.

## Test
Use Razorpay's test-mode checkout. Complete a simulated successful payment and confirm that the Drive button appears only after the server verifies the signature and fetches a captured payment of exactly ₹99 INR. Also test a failed/cancelled payment. Do not use real money with Test Mode keys.

## Important
- This project does not include a database or a durable order history. Keep Razorpay receipts and dashboard records for support/reconciliation.
- The Drive URL is a shareable link; a buyer can forward it. For per-customer access control, use a private file-delivery system.
- Do not launch real ads until the Live Mode account is activated, separate Live keys are configured, and end-to-end live checks are completed.
