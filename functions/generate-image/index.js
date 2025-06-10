export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method !== "POST" || url.pathname !== "/generate-image") {
      return new Response("Not found", { status: 404 });
    }

    const prompt = `A digitally illustrated Purple Pepe frog...`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
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
  }
}
