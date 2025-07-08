export async function handleTextToImage(request: Request, env: any): Promise<Response> {
  const { prompt } = await request.json();

  try {
    const result = await env.AI.run('@cf/stability/stable-diffusion-v1-4', {
      prompt: prompt || 'a futuristic city at sunset'
    });

    // result is base64 image
    const base64 = result && typeof result === 'string' ? result : null;

    if (!base64) {
      return new Response(JSON.stringify({ error: 'No image returned from model', result }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ image: base64 }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Text-to-Image failed', details: err }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
