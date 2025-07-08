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
<html lang="en" ng-app="AIApp">
<head>
  <meta charset="UTF-8" />
   <title>Dream Machine 
   </br>Type in your imagination and watch it come to life! </title>

  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f9f9f9;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #fff;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    input, select, button {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
    }
    img, audio {
      display: block;
      margin-top: 15px;
      max-width: 100%;
    }
    .output {
      background: #f3f3f3;
      padding: 10px;
      margin-top: 20px;
      border: 1px solid #ccc;
    }
  </style>
</head>
<body>

<div class="container" ng-controller="MainController">
  <h2>AI Multi-Model Interface</h2>

  <label>Choose a feature:</label>
  <select ng-model="feature">
    <option value="text-to-image">Text to Image</option>
    <option value="text-to-speech">Text to Speech</option>
    <option value="gif-generator">GIF Generator</option>
  </select>

  <label>Enter Prompt/Text:</label>
  <input type="text" ng-model="userInput" placeholder="e.g. A futuristic city at sunset" />

  <button ng-click="submit()">Generate</button>

  <div class="output" ng-if="imageUrl">
    <img ng-src="{{ imageUrl }}" alt="Generated Image">
  </div>

  <div class="output" ng-if="audioUrl">
    <audio controls>
      <source ng-src="{{ audioUrl }}" type="audio/mpeg">
    </audio>
  </div>

  <div class="output" ng-if="jsonOutput">
    <pre>{{ jsonOutput | json }}</pre>
  </div>
</div>

<script>
  angular.module('AIApp', [])
    .controller('MainController', ['$scope', '$http', function($scope, $http) {
      $scope.feature = 'text-to-image';
      $scope.userInput = '';
      $scope.imageUrl = '';
      $scope.audioUrl = '';
      $scope.jsonOutput = null;

      $scope.submit = function() {
        $scope.imageUrl = '';
        $scope.audioUrl = '';
        $scope.jsonOutput = null;

        fetch(\`/\${$scope.feature}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: $scope.userInput,
            text: $scope.userInput
          })
        })
        .then(async (res) => {
          if ($scope.feature === 'text-to-speech') {
            const blob = await res.blob();
            $scope.audioUrl = URL.createObjectURL(blob);
          } else {
            const json = await res.json();
            const image = json.image || json.output?.[0] || json.url || '';
            if (image.startsWith('http')) {
              $scope.imageUrl = image;
            } else if (image) {
              $scope.imageUrl = \`data:image/jpeg;base64,\${image}\`;
            }
            $scope.jsonOutput = json;
          }
          $scope.$apply();
        })
        .catch(err => {
          console.error('Error:', err);
          alert('Something went wrong. See console.');
        });
      };
    }]);
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
