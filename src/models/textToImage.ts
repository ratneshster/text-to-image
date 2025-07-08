export async function handleTextToImage(request: Request, env: any): Promise<Response> {
  const { prompt } = await request.json();

  try {
    const result = await env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
      prompt: prompt || 'a dreamlike sunset over a futuristic city',
    });

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Text-to-Image failed', details: err }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

