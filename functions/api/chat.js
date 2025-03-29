export async function onRequestPost(context) {
  try {
    const { history } = await context.request.json();
    const apiKey = context.env.OPENAI_API_KEY;
    const systemPrompt = context.env.SYSTEM_PROMPT;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || [])
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7
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