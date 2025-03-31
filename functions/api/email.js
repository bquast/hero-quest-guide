export async function onRequestPost(context) {
  try {
    const { email, history } = await context.request.json();
    const resendApiKey = context.env.RESEND_API_KEY;

    if (!email || !history || !Array.isArray(history)) {
      return new Response(JSON.stringify({ error: true, message: "Missing email or history" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const chatTranscript = history.map(entry => {
      const label = entry.role === "user" ? "You" : "M";
      return `${label}: ${entry.content}`;
    }).join("\n\n");

    const payload = {
      from: "Hero Quest Guide <onboarding@resend.dev>",
      to: [email],
      subject: "Your StoryBrand Conversation",
      text: chatTranscript
    };

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.json();
      return new Response(JSON.stringify({ error: true, message: error.message || "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: true,
      message: err.message || "Unexpected error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
