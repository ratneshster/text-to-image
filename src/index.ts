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

    if (path === '/') {
      return new Response(
        `<html><body><h1>Welcome to Multi-Model AI Worker</h1></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    return new Response('Method Not Allowed', { status: 405 });
  }
};
