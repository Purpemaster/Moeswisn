export async function onRequestPost(context) {
  try {
    const prompt = "A purple cartoon frog with sunglasses, digital illustration, highly detailed, 4k";

    console.log("🔑 OpenAI API-Key (gekürzt):", context.env.OPENAI_API_KEY?.slice(0, 6) + "...");

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${context.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    const data = await res.json();
    console.log("🎨 OpenAI Antwort:", JSON.stringify(data, null, 2));

    if (!data?.data?.[0]?.url) {
      throw new Error("Keine Bild-URL zurückgegeben.");
    }

    return new Response(JSON.stringify({ image: data.data[0].url }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("❌ Fehler bei der Bildgenerierung:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
}
