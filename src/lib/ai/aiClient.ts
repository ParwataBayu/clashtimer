export async function callAIEndpoint(endpoint: string, payload: object) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let data: any = null;
    let textBody = '';
    try {
      textBody = await response.text();
      data = textBody ? JSON.parse(textBody) : null;
    } catch (parseErr) {
      // not JSON, keep raw text
      data = null;
    }

    if (!response.ok || (data && data.error)) {
      console.error('API Route Error:', {
        endpoint,
        status: response.status,
        body: data ?? textBody,
      });

      const message = (data && (data.error || data.details)) || textBody || `Request failed: ${response.status}`;
      throw new Error(String(message));
    }

    return data ?? textBody;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}
