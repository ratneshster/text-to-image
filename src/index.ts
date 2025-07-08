import { handleTextToImage } from './models/textToImage';
import { handleTextToSpeech } from './models/textToSpeech';
import { handleGifGenerator } from './models/gifGenerator';

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'POST') {
      switch (path) {
        case '/text-to-image':
          return handleTextToImage(request, env);
        case '/text-to-speech':
          return handleTextToSpeech(request, env);
        case '/gif-generator':
          return handleGifGenerator(request, env);
        default:
          return new Response('Not Found', { status: 404 });
      }
    }

    // Serve frontend
    if (request.method === 'GET' && path === '/') {
      const html = await fetch('https://your-bucket-or-static-source/index.html');
      return new Response(await html.text(), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response('Method Not Allowed', { status: 405 });
  }
};
