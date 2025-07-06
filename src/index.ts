export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      const prompt = url.searchParams.get("prompt");
      const hasPrompt = !!prompt;

      // If prompt exists, fetch the generated image
      let imageHTML = "";
      if (hasPrompt) {
        const inputs = { prompt };
        const imageResponse = await env.AI.run(
          "@cf/stabilityai/stable-diffusion-xl-base-1.0",
          inputs
        );
        const base64Image = await imageResponse.arrayBuffer().then((buf) =>
          Buffer.from(buf).toString("base64")
        );
        imageHTML = `
          <div class="image-container">
            <img src="data:image/png;base64,${base64Image}" alt="Generated Image" />
          </div>`;
      }

      // Serve HTML page with input and image
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Dream Machine</title>
          <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js"></script>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f0f0f0;
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .page-header {
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              margin-top: 20px;
              color: #333;
            }
            .subtitle {
              text-align: center;
              font-size: 16px;
              margin-bottom: 30px;
              color: #666;
            }
            form {
              margin-bottom: 40px;
              text-align: center;
            }
            input[type="text"] {
              width: 300px;
              padding: 10px;
              font-size: 16px;
            }
            button {
              padding: 10px 20px;
              font-size: 16px;
              margin-left: 10px;
              cursor: pointer;
            }
            .image-container {
              max-width: 90vw;
              max-height: 70vh;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
              margin-top: 20px;
              border: 1px solid #ccc;
              background: white;
              padding: 10px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .image-container img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body ng-controller="MyController">
          <div class="page-header">Welcome to Your Dream Machine</div>
          <div class="subtitle">Type in your imagination and watch it come to life!</div>
          <form method="get" action="/">
            <label for="prompt">Describe the Image you want to generate:</label><br/><br/>
            <input type="text" id="prompt" name="prompt" value="${prompt || ""}" required />
            <button type="submit">Generate Image</button>
          </form>
          ${imageHTML}
        </body>
        </html>
      `;

      return new Response(html, {
        headers: { "content-type": "text/html" },
      });
    }

    // Fallback
    return new Response("404 Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
