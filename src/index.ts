export default {
  async fetch(request: Request, env: Record<string, any>): Promise<Response> {
    const url = new URL(request.url);

    // Style modifier for all image prompts
    const styleMod = " social-media friendly composition,  trendy, realistic, eye-catching,non-robotic, positive,lively,natural";

        if (url.pathname === "/") {
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Dream Machine</title>
  <style>
    body {
      margin: 0;
      font-family: 'Orbitron', sans-serif;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      color: #f8f8f8;
      text-align: center;
    }
      nav {
      display: flex;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.6);
      padding: 10px 0;
      border-bottom: 2px solid #0ff;
    }

    nav a {
      color: #0ff;
      text-decoration: none;
      margin: 0 20px;
      font-weight: bold;
      position: relative;
      padding: 8px 12px;
      transition: color 0.3s, background-color 0.3s;
      border-radius: 4px;
    }

    nav a:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      background: rgba(0, 0, 0, 0.8);
      color: #0ff;
      padding: 4px 8px;
      border: 1px solid #0ff;
      border-radius: 4px;
      font-size: 0.8em;
      bottom: -35px;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
    }

    nav a:hover {
      color: #fff;
    }

    nav a.active {
      background-color: #0ff;
      color: #000;
    }
    h1 {
      font-size: 2.8em;
      margin-top: 40px;
    }
    .input-container {
      margin: 30px auto;
      width: 90%;
      max-width: 600px;
    }
    .title {
      font-size: 2.5em;
      margin-top: 20px;
      margin-bottom: 20px;
      font-weight: bold;
    }
    .subtitle {
      font-size: 1.2em;
      margin-bottom: 30px;
      margin-top: 30px;
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
      width: 100%;
      padding: 15px;
      border: none;
      border-radius: 6px;
      font-size: 1.2em;
      background-color: #1a1a2e;
      color: #0ff;
      box-shadow: 0 0 10px #0ff;
    }
    button {
      margin-top: 20px;
      padding: 14px 30px;
      font-size: 1em;
      border: none;
      border-radius: 6px;
      background: #0ff;
      color: #000;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.3s;
      box-shadow: 0 0 10px #0ff;
    }
     button:hover {
      background: #00f5ff;
    }
   #output {
      margin-top: 40px;
      padding: 20px;
    }
  </style>
</head>
<body>
 <nav id="menu">
   
    <a href="#" data-mode="comment" data-tooltip="Struggling with captions? No problem—AI’s got you covered">✏️ Caption</a>
    <a href="#" data-mode="image" data-tooltip="Turn your words into stunning visuals — no art degree required">🖼️ Image</a>
    <a href="#" data-mode="avatar" data-tooltip="Meet the AI version of your thoughts">👤 Avatar</a>
    <a href="#" data-mode="motion" data-tooltip="GIF it life ❤️ — animate your dreams frame by frame">🎞️ Motion</a>
    <a href="#" data-mode="reroll" data-tooltip="Same prompt, different aesthetic. Tap for a fresh style">🎨 Re-roll</a>
    <a href="#" data-mode="tts" data-tooltip="Give your thoughts a voice — literally">🔊 TTS</a>
  </nav>
  <div class="title">
    <img src="https://emojiapi.dev/api/v1/milky_way/64.png" width="32" alt="🌌"> Welcome to Your Dream Machine
  </div>
  <div class="subtitle">Type in your imagination and watch it come to life!</div>

 
  <input id="prompt" type="text" class="input-container" placeholder="Enter your prompt..." value="cyberpunk cat">
  <br>
  <button onclick="generate()">Generate</button>

  <div class="output" id="output"> </div>

  <script>
   document.querySelectorAll('#menu a').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('#menu a').forEach(a => a.classList.remove('active'));
        el.classList.add('active');
      });
    });
    async function generate() {
      const active = document.querySelector('#menu a.active');
      const mode = active?.dataset.mode || 'image';
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
        const text = prompt && prompt.trim() ? prompt : "Hello, this is a test.";

        try {
          // Correctly destructure the output from the run() method
          const { audio } = await env.AI.run("@cf/myshell-ai/melotts", {
            prompt: text,
          });

          // Cloudflare returns a base64 encoded MP3 audio string.
          // We need to decode it to a Buffer and then a Blob.
          const audioBlob = new Blob(
            [Uint8Array.from(atob(audio), (c) => c.charCodeAt(0))],
            { type: "audio/mpeg" }
          );

          // Return the audio blob as a new Response object
          return new Response(audioBlob, {
            headers: {
              "content-type": "audio/mpeg",
            },
          });
        } catch (err) {
          // Use a try/catch block to handle errors gracefully
          return new Response("TTS Error: " + err.message, { status: 500 });
        }
      }

      // Default: image generation (add styleMod)
      const image = await env.AI.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", { prompt: prompt + styleMod });
      return new Response(image, { headers: { "content-type": "image/png" } });
    }

    return new Response("404 Not Found", { status: 404 });
  }
};