export async function onRequestPost(context) {
  try {
    const prompt = "A friendly green creature in a futuristic outfit, standing in a colorful sci-fi city, digital painting";

    console.log("🔑 OpenAI API-Key (gekürzt):", context.env.OPENAI_API_KEY?.slice(0, 6) + "...");

    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${context.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "dall-e-2",
        prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    const data = await openaiResponse.json();
    console.log("🎨 OpenAI Antwort:", JSON.stringify(data, null, 2));

    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "No image returned" }), { status: 500 });
    }

    return new Response(JSON.stringify({ image: imageUrl }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("❌ Fehler bei der Bildgenerierung:", err);
    return new Response(JSON.stringify({ error: "Image generation failed" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
