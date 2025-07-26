export default {
  async fetch(request: Request, env: Record<string, any>): Promise<Response> {
    const url = new URL(request.url);

    // Style modifier for all image prompts
    const styleMod = "Minimalistic pastel background, modern flat-style design, soft lighting, high aesthetic appeal, social-media friendly composition, clean white space, light tones, centered subject with gentle shadows, perfect for Instagram or Pinterest";

        if (url.pathname === "/") {
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Dream Machine</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      margin: 40px;
      background-color: #e6f0f3; /* Soothing, colorblind-friendly */
      color: #333;
    }
    .title {
      font-size: 2.5em;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .subtitle {
      font-size: 1.2em;
      margin-bottom: 30px;
      color: #555;
    }
    .mode-options {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    input[type="text"] {
      width: 60%;
      padding: 10px;
      margin-top: 20px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }
    button {
      margin-top: 20px;
      padding: 10px 20px;
      font-size: 1em;
      border: none;
      border-radius: 4px;
      background-color: #4cafaa;
      color: white;
      cursor: pointer;
    }
    button:hover {
      background-color: #3b9999;
    }
    .output {
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="title">
    <img src="https://emojiapi.dev/api/v1/milky_way/64.png" width="32" alt="🌌"> Welcome to Your Dream Machine
  </div>
  <div class="subtitle">Type in your imagination and watch it come to life!</div>

  <div class="mode-options">
    <label><input type="radio" name="mode" value="image" checked> AI Image Generator</label>
    <label><input type="radio" name="mode" value="comment"> Caption Generator</label>
    <label><input type="radio" name="mode" value="avatar"> AI Avatar Generator</label>
    <label><input type="radio" name="mode" value="motion"> Dream in Motion</label>
    <label><input type="radio" name="mode" value="reroll"> Style Re-roll</label>
    <label><input type="radio" name="mode" value="tts"> Text-to-Speech</label>
  </div>

  <input id="prompt" type="text" placeholder="Enter your prompt..." value="cyberpunk cat">
  <br>
  <button onclick="generate()">Generate</button>

  <div class="output" id="output"> </div>

  <script>
    async function generate() {
      const mode = document.querySelector('input[name="mode"]:checked').value;
      const prompt = document.getElementById("prompt").value;
      const output = document.getElementById("output");

      output.innerHTML = "<p><em>Generating...</em></p>";

      // Only encode in fetch URL, not before
      const response = await fetch(\`/generate?mode=\${mode}&prompt=\${encodeURIComponent(prompt)}\`);

      if (mode === "tts") {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
       
        output.innerHTML = '<audio controls src="' + url + '"></audio>';

      } else if (mode === "comment") {
        const text = await response.text();
        output.innerHTML = \`<p><strong>Caption:</strong> \${text}</p>\`;

      } else if (mode === "motion") {
        const promptBase = document.getElementById("prompt").value;
        const brighten = ", bright, vibrant colors, well-lit, high exposure, vivid, colorful, illuminated";
        const prompts = [
          promptBase + brighten,
          promptBase + ", motion blur" + brighten,
          promptBase + ", cinematic lighting" + brighten
        ];
        output.innerHTML = "<p><em>Generating images...</em></p>";

      const imageBlobs = await Promise.all(prompts.map(async (p) => {
      const resp = await fetch(\`/generate?mode=image&prompt=\${encodeURIComponent(p)}\`);
     return await resp.blob();
    }));


      output.innerHTML = imageBlobs.map(
    (blob, i) => \`<img src="\${URL.createObjectURL(blob)}" style="max-width:32%;margin:5px;">\`
  ).join("");


       const zipResp = await fetch(\`/generate?mode=motion&prompt=\${encodeURIComponent(promptBase)}\`);

output.innerHTML += \`
  <div style="margin-top:20px">
    <p><strong>Loop:</strong></p>
    <a href="\${zipUrl}" download="dream-motion.zip">Download Dream Motion ZIP</a>
  </div>
\`;
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        output.innerHTML = \`<img src="\${url}" style="max-width: 100%; margin-top: 20px;"><br><a href="\${url}" download="dream-image.png">Download</a>\`;
      }
    }
  </script>
</body>
</html>`;
      return new Response(html, { headers: { "content-type": "text/html" } });
    }

    if (url.pathname === "/generate") {
      let prompt = url.searchParams.get("prompt") || "cyberpunk cat";
      prompt = decodeURIComponent(prompt);
      const mode = url.searchParams.get("mode") || "image";

      if (mode === "motion") {
        const prompts = [
          prompt + styleMod,
          prompt + ", motion blur" + styleMod,
          prompt + ", cinematic lighting" + styleMod
        ];
        // ...existing code for motion...
        const images = await Promise.all(prompts.map(async (p) => {
          const img = await env.AI.run("@cf/lykon/dreamshaper-8-lcm", { prompt: p });

          // Type check and handle valid types
          if (img instanceof Response) return await img.arrayBuffer();
          if (img instanceof ArrayBuffer || img instanceof Uint8Array) return img;
          if (typeof img.arrayBuffer === "function") return await img.arrayBuffer();

          // If you get here, log and return the actual content for debugging
          console.error("Invalid AI model output:", img);

          throw new Error("Unknown image type from AI model. Got: " + JSON.stringify(img));
        }));
        // ...existing JSZip code...
        let JSZip;
        try {
          JSZip = (await import("jszip")).default;
        } catch (e) {
          return new Response("ZIP not supported in this environment.", { status: 501 });
        }
        const zip = new JSZip();
        images.forEach((img, i) => {
          let data = img;
          if (img instanceof ArrayBuffer) {
            data = new Uint8Array(img);
          } else if (img.buffer && img.byteLength !== undefined) {
            data = new Uint8Array(img.buffer, img.byteOffset, img.byteLength);
          }
          zip.file("frame" + (i + 1) + ".png", data);
        });
        const blob = await zip.generateAsync({ type: "arraybuffer" });
        return new Response(blob, { headers: { "content-type": "application/zip" } });
      }

      if (mode === "avatar") {
        const image = await env.AI.run("@cf/lykon/dreamshaper-8-lcm", { prompt: "Pixar style portrait of " + prompt + styleMod });
        return new Response(image, { headers: { "content-type": "image/png" } });
      }

if (mode === "reroll") {
  const prompt = decodeURIComponent(url.searchParams.get("prompt") || "default subject");
  const runway_api_key = env.RUNWAY_API_KEY;
  const requestBody = {
    model: "gen2_text_to_video",
    prompt: prompt,
    seed: Math.floor(Math.random() * 1e6),
    duration: 4
  };

  const apiRes = await fetch("https://api.runwayml.com/v1/text-to-video", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${runway_api_key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!apiRes.ok) {
    const err = await apiRes.text();
    return new Response(`Runway API Error: ${err}`, { status: 502 });
  }

  const json = await apiRes.json();
  let status = json.status;
  let outputUrl = null;
  const jobId = json.jobId;

  while (status !== "succeeded" && status !== "failed") {
    await new Promise((r) => setTimeout(r, 2000));
    const st = await fetch(`https://api.runwayml.com/v1/tasks/${jobId}`, {
      headers: { "Authorization": `Bearer ${runway_api_key}` }
    });
    const sj = await st.json();
    status = sj.status;
    outputUrl = sj.outputUrl || null;
  }

  if (status !== "succeeded" || !outputUrl) {
    return new Response(`Generation failed`, { status: 500 });
  }

  const html = `
    <html>
    <body style="background:#111;color:white;text-align:center;font-family:sans-serif">
      <h2>Generated Video</h2>
      <video controls width="512" autoplay loop>
        <source src="${outputUrl}" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { "content-type": "text/html" },
  });
}

      if (mode === "comment") {
        // ...existing comment code...
        const messages = [
          { role: "system", content: "You are an Instagram caption generator." },
          { role: "user", content: "Suggest a caption for: " + prompt }
        ];
        const aiResponse = await env.AI.run("@cf/meta/llama-2-7b-chat-int8", { messages });
        let text =
          aiResponse.result ||
          aiResponse.content ||
          aiResponse.response ||
          aiResponse.choices?.[0]?.message?.content ||
          JSON.stringify(aiResponse);
        if (typeof text === "string" && text.startsWith('"') && text.endsWith('"')) {
          text = text.slice(1, -1);
        }
        return new Response(text, { headers: { "content-type": "text/plain; charset=UTF-8" } });
      }

      if (mode === "tts") {
        // ...existing TTS code...
        const text = prompt && prompt.trim() ? prompt : "Hello, this is a test.";
        const audio = await env.AI.run("@cf/myshell-ai/melotts", { prompt: text });
        if (audio instanceof Response) {
          if (!audio.ok) {
            const err = await audio.text();
            return new Response("TTS Error: " + err, { status: 500 });
          }
          const ct = audio.headers.get("content-type") || "";
          if (ct.startsWith("audio/")) {
            return audio;
          }
          const err = await audio.text();
          return new Response("TTS Error: " + err, { status: 500 });
        }
        return new Response(audio, { headers: { "content-type": "audio/wav" } });
      }

      // Default: image generation (add styleMod)
      const image = await env.AI.run("@cf/lykon/dreamshaper-8-lcm", { prompt: prompt + styleMod });
      return new Response(image, { headers: { "content-type": "image/png" } });
    }

    return new Response("404 Not Found", { status: 404 });
  }
};