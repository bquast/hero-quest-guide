export async function onRequestPost(context) {
  try {
    const { history } = await context.request.json();
    const apiKey = context.env.OPENAI_API_KEY;
    const memoryPrompt = context.env.MEMORY_PROMPT;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: memoryPrompt
          },
          {
            role: "user",
            content: history.map(h => `${h.role === "user" ? "You" : "M"}: ${h.content}`).join("\n\n")
          }
        ],
        temperature: 0
      })
    });

    const data = await response.json();
    let raw = data.choices[0].message.content.trim();

    // strip code block formatting if present
    raw = raw.replace(/^```(?:json)?\n?/, "").replace(/```$/, "");

    const parsed = JSON.parse(raw);

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: true, message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
