import crypto from "node:crypto";

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify(body),
});

export async function handler(event) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const deliveryUrl = process.env.DELIVERY_URL;
  if (!keyId || !keySecret || !deliveryUrl) {
    return json(500, { error: "Payment verification or delivery is not configured yet." });
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json(400, { error: "Missing payment verification details." });
    }

    // Verify Checkout signature using the server-only API secret.
    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const received = Buffer.from(razorpay_signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    if (received.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(received, expectedBuffer)) {
      return json(400, { error: "The payment signature is invalid." });
    }

    // Independently fetch the payment from Razorpay and require captured status,
    // the expected order, and exactly ₹99 INR before releasing the link.
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const paymentResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`,
      { headers: { "Authorization": `Basic ${auth}` } }
    );
    const payment = await paymentResponse.json();
    if (!paymentResponse.ok) {
      console.error("Razorpay payment fetch failed:", payment);
      return json(502, { error: "Could not confirm payment status with Razorpay. Please contact support if money was deducted." });
    }

    if (payment.order_id !== razorpay_order_id ||
        payment.amount !== 9900 ||
        payment.currency !== "INR" ||
        payment.status !== "captured") {
      return json(409, { error: "Payment is not yet captured for the correct ₹99 order. Please wait and contact support if money was deducted." });
    }

    return json(200, { verified: true, delivery_url: deliveryUrl });
  } catch (error) {
    console.error("Payment verification error:", error);
    return json(400, { error: "Invalid verification request." });
  }
      }
