export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Prüfen, ob der Pfad korrekt ist
    if (url.pathname !== "/generate-image") {
      return new Response("Not found", { status: 404 });
    }

    // Prompt für das Bild
    const prompt = `A digitally illustrated Purple Pepe frog in various wild styles and accessories, trending meme aesthetics, vivid colors, high detail, no text`;

    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`, // Aus Cloudflare Secrets
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
        }),
      });

      const data = await response.json();
      const imageUrl = data?.data?.[0]?.url || "";

      return new Response(JSON.stringify({ image: imageUrl }), {
        headers: { "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Fehler bei der Bildgenerierung." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}
