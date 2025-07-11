export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve the HTML page
    if (url.pathname === "/") {
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Dream Machine</title>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js"></script>
  <style>
    :root {
      --bg-color: #f0f0f5;
      --text-color: #000;
      --header-bg: #fff;
      --border-color: #ccc;
      --button-bg: #e0e0e0;
      --button-text: #000;
    }
    body.dark-mode {
      --bg-color: #121212;
      --text-color: #eee;
      --header-bg: #1e1e1e;
      --border-color: #444;
      --button-bg: #333;
      --button-text: #eee;
    }
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-color);
    }
    .header {
      position: fixed;
      top: 0;
      width: 100%;
      background: var(--header-bg);
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 1000;
      text-align: center;
    }
    .theme-toggle {
      position: absolute;
      top: 20px;
      right: 100px;
      font-size: 14px;
      max-width: 120px;
      white-space: nowrap;
      background-color: var(--header-bg);
      padding: 4px 8px;
      border-radius: 5px;
      box-shadow: 0 0 5px rgba(0,0,0,0.1);
    }
    .theme-toggle label { cursor: pointer; }
    .page-header {
      font-size: 28.8px;
    }
    .subtitle {
      font-size: 16px;
      color: var(--text-color);
      animation: fadeSlide 3s ease-in-out infinite alternate;
    }
    @keyframes fadeSlide {
      0% { opacity: 0; transform: translateY(10px); }
      50% { opacity: 1; transform: translateY(0px); }
      100% { opacity: 0.8; transform: translateY(-5px); }
    }
    .content {
      margin-top: 280px;
      text-align: center;
    }
    input[type="text"] {
      width: 300px;
      padding: 10px;
      font-size: 16px;
      background-color: var(--bg-color);
      color: var(--text-color);
      border: 1px solid var(--border-color);
    }
    button {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      margin: 10px;
      background-color: var(--button-bg);
      color: var(--button-text);
      border: 1px solid var(--border-color);
      border-radius: 4px;
    }
    .loader {
      font-size: 18px;
      margin-top: 10px;
      color: var(--text-color);
    }
    .image-container {
      margin-top: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    img {
      max-width: 90vw;
      max-height: 70vh;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      margin-bottom: 15px;
    }
    .gold-glow {
      padding: 10px 24px;
      font-size: 16px;
      color: white;
      background: linear-gradient(135deg, #FFD700, #FFA500);
      border: none;
      border-radius: 6px;
      cursor: pointer;
      margin: 10px;
      box-shadow: 0 0 10px rgba(255, 215, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.4);
      transition: box-shadow 0.3s ease, transform 0.2s ease;
      font-weight: bold;
    }
    .gold-glow:hover {
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.8), 0 0 25px rgba(255, 215, 0, 0.6);
      transform: scale(1.05);
    }
  </style>
</head>
<body ng-app="dreamApp" ng-controller="MyController" ng-class="theme">
  <div class="header">
    <div class="theme-toggle">
      <label>
        <input type="checkbox" ng-model="darkMode" ng-change="toggleTheme()" />
        Dark Mode
      </label>
    </div>
    <div class="page-header"><strong>Welcome to Your Dream Machine</strong></div>
    <br/>
    <div class="subtitle">{{typedText}}</div>
    <div style="margin-top: 20px;">
      <label><input type="radio" ng-model="selectedOption" value="image" /> Image Generator</label>
      <label style="margin-left: 15px;"><input type="radio" ng-model="selectedOption" value="gif" /> Animated Image Generator</label>
    </div>

    <form ng-show="selectedOption === 'image'" ng-submit="generateImage()">
      <input type="text" ng-model="prompt" placeholder="Describe your image..." required />
      <button type="submit" class="gold-glow">Generate Image</button>
    </form>

    <form ng-show="selectedOption === 'gif'" ng-submit="generateGIF()">
      <input type="text" ng-model="gifPrompt" placeholder="Describe your animation..." required />
      <button type="submit" class="gold-glow">Generate GIF</button>
    </form>

    <div class="loader" ng-show="loading">Generating...</div>
  </div>

  <div class="content">
    <div class="image-container" ng-if="selectedOption === 'image' && imageData">
      <img ng-src="{{imageData}}" alt="Generated Image" />
      <div>
        <button ng-click="downloadImage()">Download</button>
        <button ng-click="shareImage()" ng-disabled="!canShare">Share</button>
      </div>
    </div>
    <div class="image-container" ng-if="selectedOption === 'gif' && gifData">
      <img ng-src="{{gifData}}" alt="Generated GIF" />
      <div><button ng-click="downloadGIF()">Download</button></div>
    </div>
  </div>

  <script>
    angular.module('dreamApp', [])
    .controller('MyController', ['$scope', '$http', function($scope, $http) {
      $scope.prompt = "cyberpunk cat";
      $scope.gifPrompt = "Bear - This featuer is brewing....";
      $scope.loading = false;
      $scope.imageData = null;
      $scope.gifData = null;
      $scope.canShare = !!navigator.share;
      $scope.typedText = "";
      $scope.selectedOption = "image";
      const fullText = "Type in your imagination and watch it come to life!";
      let index = 0;
      function typeWriter() {
        if (index < fullText.length) {
          $scope.typedText += fullText.charAt(index++);
          setTimeout(typeWriter, 50);
          $scope.$applyAsync();
        }
      }
      typeWriter();

      $scope.darkMode = false;
      $scope.theme = '';
      $scope.toggleTheme = function() {
        $scope.theme = $scope.darkMode ? 'dark-mode' : '';
      };

      $scope.generateImage = function() {
        $scope.loading = true;
        $http.get('/generate?prompt=' + encodeURIComponent($scope.prompt), { responseType: 'arraybuffer' })
          .then(function(response) {
            const blob = new Blob([response.data], { type: 'image/png' });
            const reader = new FileReader();
            reader.onload = function(e) {
              $scope.$apply(() => {
                $scope.imageData = e.target.result;
                $scope.loading = false;
              });
            };
            reader.readAsDataURL(blob);
          }).catch(err => {
            console.error('Image generation failed', err);
            $scope.loading = false;
          });
      };

      $scope.generateGIF = function() {
        $scope.loading = true;
        $http.get('/generate-gif?prompt=' + encodeURIComponent($scope.gifPrompt), { responseType: 'arraybuffer' })
          .then(function(response) {
            const blob = new Blob([response.data], { type: 'image/gif' });
            const reader = new FileReader();
            reader.onload = function(e) {
              $scope.$apply(() => {
                $scope.gifData = e.target.result;
                $scope.loading = false;
              });
            };
            reader.readAsDataURL(blob);
          }).catch(err => {
            console.error('GIF generation failed', err);
            $scope.loading = false;
          });
      };

      $scope.downloadImage = function() {
        const a = document.createElement('a');
        a.href = $scope.imageData;
        a.download = "dream-image.png";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      };

      $scope.downloadGIF = function() {
        const a = document.createElement('a');
        a.href = $scope.gifData;
        a.download = "animated-image.gif";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      };

      $scope.shareImage = function() {
        fetch($scope.imageData)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "dream-image.png", { type: "image/png" });
            navigator.share({
              title: "My Dream Image",
              text: "Check out this image I created!",
              files: [file]
            }).catch(console.error);
          });
      };
    }]);
  </script>
</body>
</html>`;
      return new Response(html, {
        headers: { "content-type": "text/html" },
      });
    }

    // Image generation endpoint using Cloudflare Workers AI
    if (url.pathname === "/generate") {
      const prompt = url.searchParams.get("prompt") || "cyberpunk cat";
      const inputs = { prompt };
      const response = await env.AI.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", inputs);
      return new Response(response, {
        headers: { "content-type": "image/png" },
      });
    }

    // GIF generation endpoint — currently using a placeholder GIF
    if (url.pathname === "/generate-gif") {
      const gifURL = "https://media.giphy.com/media/IThjAlJnD9WNO/giphy.gif"; // Bear
      const gifResponse = await fetch(gifURL);
      const gifBlob = await gifResponse.arrayBuffer();
      return new Response(gifBlob, {
        headers: { "content-type": "image/gif" },
      });
    }

    return new Response("404 Not Found", { status: 404 });
  }
};
