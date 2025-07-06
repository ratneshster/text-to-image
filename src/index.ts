export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      // Serve HTML page with prompt input
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Your Image Generator</title>
        </head>
        <body>
          <h1>🖼️ Your Image Generator</h1>
          <form action="/generate" method="get">
            <label for="prompt">Enter a prompt(The Impage you want):</label><br/>
            <input type="text" id="prompt" name="prompt" value="cyberpunk cat" required />
            <button type="submit">Generate Image</button>
          </form>
        </body>
        </html>
      `;
      return new Response(html, {
        headers: { "content-type": "text/html" },
      });
    }

    if (url.pathname === "/generate") {
      const prompt = url.searchParams.get("prompt") || "cyberpunk cat";

      const inputs = { prompt };

      const response = await env.AI.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        inputs,
      );

      return new Response(response, {
        headers: {
          "content-type": "image/png",
        },
      });
    }

    // Default fallback
    return new Response("404 Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
