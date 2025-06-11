export async function onRequestPost(context) {
  try {
    const prompt = `A digitally illustrated Purple Pepe frog in various wild styles and accessories, trending meme aesthetics, vivid colors, high detail, no text`;

    // 👉 Debug-Log zum Überprüfen, ob der API-Key gesetzt ist
    console.log("🔑 OpenAI API-Key (gekürzt):", context.env.OPENAI_API_KEY?.slice(0, 5) + '...');

    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${context.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    const data = await openaiResponse.json();

    // 👉 Log zur Kontrolle, ob ein Bild zurückgegeben wurde
    console.log("🎨 OpenAI Antwort:", JSON.stringify(data, null, 2));

    const imageUrl = data?.data?.[0]?.url;

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "No image returned" }), { status: 500 });
    }

    return new Response(JSON.stringify({ image: imageUrl }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("❌ Fehler beim Generieren:", err);
    return new Response(JSON.stringify({ error: "Image generation failed" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
