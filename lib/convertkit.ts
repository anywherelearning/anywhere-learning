export async function subscribeToConvertKit(email: string) {
  const formId = process.env.CONVERTKIT_FORM_ID;
  const apiKey = process.env.CONVERTKIT_API_KEY;
  if (!formId || !apiKey) return;

  await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, email }),
  });
}

export async function tagBuyerInConvertKit(email: string, productSlug: string) {
  try {
    await fetch(`https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.CONVERTKIT_API_KEY,
        email,
        tags: ['buyer', `product:${productSlug}`],
      }),
    });
  } catch (error) {
    console.error('ConvertKit tagging error:', error);
  }
}
