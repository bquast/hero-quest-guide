export async function onRequestPost(context) {
  try {
    const { history } = await context.request.json();
    const apiKey = context.env.OPENAI_API_KEY;
    const systemPrompt = context.env.SYSTEM_PROMPT;
    const model = context.env.MODEL;
    const temperature = parseFloat(context.env.TEMPERATURE);
    const url = context.env.URL;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || [])
    ];

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature
      })
    });

    const data = await response.json();

    return new Response(JSON.stringify({
      reply: data.choices[0].message.content
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: true,
      message: err.message || "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
