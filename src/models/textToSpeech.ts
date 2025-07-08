export async function handleTextToSpeech(request: Request, env: any): Promise<Response> {
  const { text } = await request.json();

  try {
    const result = await env.AI.run('@cf/openai/tts-1', {
      text: text || 'Hello from your AI assistant!',
      voice: 'alloy'
    });

    return new Response(result.audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="speech.mp3"'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Text-to-Speech failed', details: err }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
