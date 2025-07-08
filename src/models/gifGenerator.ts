export async function handleGifGenerator(request: Request, env: any): Promise<Response> {
  const { prompt } = await request.json();

  try {
    const result = await env.AI.run('@cf/lykon/dreamshaper-8-lcm', {
      prompt: prompt || 'an animated robot dancing',
    });

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'GIF generation failed', details: err }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
