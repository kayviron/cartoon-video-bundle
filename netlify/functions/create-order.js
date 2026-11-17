const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify(body),
});

export async function handler() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return json(500, { error: "Payment system is not configured yet." });

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 9900,
        currency: "INR",
        receipt: `cartoon_${Date.now()}`,
        notes: { product: "5000+ Cartoon Video Bundle" },
      }),
    });
    const order = await response.json();
    if (!response.ok) {
      console.error("Razorpay order creation failed:", order);
      return json(502, { error: "Razorpay could not create the order. Please try again." });
    }
    return json(200, {
      key_id: keyId,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return json(500, { error: "Unable to start checkout right now." });
  }
      }
