// functions/chat.js
export async function onRequestPost(context) {
  const { message } = await context.request.json();
  const apiKey = context.env.OPENAI_API_KEY;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: message }],
      temperature: 0.7
    })
  });

  const data = await response.json();
  return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
    headers: { "Content-Type": "application/json" }
  });
}