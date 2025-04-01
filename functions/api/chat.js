export async function onRequestPost(context) {
  try {
    const { history, memory } = await context.request.json();
    const apiKey = context.env.OPENAI_API_KEY;
    const systemPrompt = context.env.SYSTEM_PROMPT;

    function memorySummary(mem) {
      const lines = [];
      if (mem?.name) lines.push(`Name: ${mem.name}`);
      if (mem?.company) lines.push(`Company: ${mem.company}`);
      if (mem?.product) lines.push(`Product: ${mem.product}`);
      if (mem?.audience) lines.push(`Audience: ${mem.audience}`);
      if (mem?.email) lines.push(`Email: ${mem.email}`);
      return lines.length
        ? `What we know about the user so far:\n` + lines.join("\n")
        : null;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...(memorySummary(memory) ? [{ role: "system", content: memorySummary(memory) }] : []),
      ...(history || [])
    ];

    const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.7
      })
    });

    const chatData = await chatRes.json();

    if (!chatData.choices || !chatData.choices[0]?.message?.content) {
      return new Response(JSON.stringify({ error: true, message: "OpenAI did not return a valid message." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const reply = chatData.choices[0].message.content;
    const updatedHistory = [...(history || []), { role: "assistant", content: reply }];

    let extractedMemory = memory;
    try {
      const extractRes = await fetch(new URL("/api/extract-memory", context.request.url).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: updatedHistory })
      });

      extractedMemory = await extractRes.json();
    } catch (err) {
      console.error("Memory extraction failed:", err.message);
    }

    return new Response(JSON.stringify({
      reply,
      memory: extractedMemory
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
