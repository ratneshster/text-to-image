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

    if (request.method === 'GET' && path === '/') {
      const html = `<!DOCTYPE html>
<html ng-app="AIApp">
<head>
  <title>AI Multi-Model Demo</title>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }
    select, input, button {
      margin: 10px 0;
      padding: 8px;
      width: 100%;
      max-width: 400px;
    }
    img, audio {
      margin-top: 20px;
      max-width: 100%;
    }
    .output-box {
      margin-top: 20px;
      background: white;
      padding: 10px;
      border: 1px solid #ccc;
    }
  </style>
</head>
<body ng-controller="MainController">
  <h1>AI Model Interface</h1>

  <label>Select Feature:</label>
  <select ng-model="feature">
    <option value="text-to-image">Text to Image</option>
    <option value="text-to-speech">Text to Speech</option>
    <option value="gif-generator">GIF Generator</option>
  </select>

  <label>Enter Prompt/Text:</label>
  <input type="text" ng-model="userInput" placeholder="Enter your prompt here" />

  <button ng-click="submit()">Generate</button>

  <div class="output-box" ng-if="imageUrl">
    <img ng-src="{{ imageUrl }}" alt="Generated Image" />
  </div>

  <div class="output-box" ng-if="audioUrl">
    <audio controls>
      <source ng-src="{{ audioUrl }}" type="audio/mpeg">
      Your browser does not support audio playback.
    </audio>
  </div>

  <div class="output-box" ng-if="jsonOutput">
    <pre>{{ jsonOutput | json }}</pre>
  </div>

  <script>
    angular.module('AIApp', [])
    .controller('MainController', function($scope, $http) {
      $scope.feature = 'text-to-image';
      $scope.userInput = '';
      $scope.imageUrl = '';
      $scope.audioUrl = '';
      $scope.jsonOutput = null;

      $scope.submit = async function() {
        $scope.imageUrl = '';
        $scope.audioUrl = '';
        $scope.jsonOutput = null;

        try {
          const res = await fetch(\`/\${$scope.feature}\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: $scope.userInput,
              text: $scope.userInput
            })
          });

          if ($scope.feature === 'text-to-speech') {
            const blob = await res.blob();
            $scope.audioUrl = URL.createObjectURL(blob);
          } else if ($scope.feature === 'text-to-image' || $scope.feature === 'gif-generator') {
            const json = await res.json();
            const image = json.image || json.output?.[0] || json.url || '';
            $scope.imageUrl = image.startsWith('http') ? image : \`data:image/jpeg;base64,\${image}\`;
            $scope.jsonOutput = json;
          } else {
            $scope.jsonOutput = await res.json();
          }

          $scope.$apply();
        } catch (err) {
          console.error(err);
          alert('Error occurred. Check console.');
        }
      };
    });
  </script>
</body>
</html>`;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response('Method Not Allowed', { status: 405 });
  }
};
