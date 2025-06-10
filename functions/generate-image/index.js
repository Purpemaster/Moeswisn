export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Nur POST-Anfragen an /generate-image erlauben
    if (request.method !== "POST" || url.pathname !== "/generate-image") {
      return new Response("Not found", { status: 404 });
    }

    try {
      const prompt = `A digitally illustrated Purple Pepe frog in various wild styles and accessories, trending meme aesthetics, vivid colors, high detail, no text`;

      const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
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

      if (!data?.data?.[0]?.url) {
        throw new Error("Kein Bild zurückgegeben.");
      }

      return new Response(JSON.stringify({ image: data.data[0].url }), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Bildgenerierung fehlgeschlagen" }), {
        headers: { "Content-Type": "application/json" },
        status: 500
      });
    }
  }
};
