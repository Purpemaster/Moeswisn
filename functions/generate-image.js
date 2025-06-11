export async function onRequestPost(context) {
  console.log("📥 Neue Bildgenerierungsanfrage erhalten");

  try {
    const prompt = `A digitally illustrated Purple Pepe frog in various wild styles and accessories, trending meme aesthetics, vivid colors, high detail, no text`;
    console.log("🧠 Prompt:", prompt);

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
    console.log("📦 Antwortdaten von OpenAI:", JSON.stringify(data));

    const imageUrl = data?.data?.[0]?.url;
    console.log("📸 Generiertes Bild URL:", imageUrl);

    if (!imageUrl) {
      console.log("❌ Kein Bild-URL in Antwort gefunden");
      return new Response(JSON.stringify({ error: "No image returned" }), { status: 500 });
    }

    return new Response(JSON.stringify({ image: imageUrl }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("🔥 Fehler bei der Bildgenerierung:", err);
    return new Response(JSON.stringify({ error: "Image generation failed" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
