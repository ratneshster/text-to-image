export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      // Serve HTML page with prompt input
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Dream Machine</title>
          <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js"></script>
        <style>
        .page-header {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin-top: 40px;
        }
        </style>
      </head>
        <body ng-controller="MyController">
        <div class="page-header">Welcome to Your Dream Machine</div>
       <div class="subtitle">Type in your imagination and watch it come to life! </div>
           <form action="/generate" method="get">
           <label for="name"></label><br/><br/>
            <label for="prompt">Describe the Image you want to generate:</label>
            <input type="text" id="prompt" name="prompt" value="cyberpunk cat" required /><br/> <br/><br/>
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
