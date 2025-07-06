export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      const html = `
      <!DOCTYPE html>
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
            right: 20px;
            top: 20px;
            font-size: 14px;
          }

          .page-header {
            font-size: 28.8px;
          }

          .subtitle {
            font-size: 16px;
            color: var(--text-color);
          }

          .content {
            margin-top: 200px;
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
        </style>
      </head>
      <body ng-app="dreamApp" ng-controller="MyController" ng-class="theme">
        <div class="header">
          <div class="theme-toggle">
            <label>
              <input type="checkbox" ng-model="darkMode" ng-change="toggleTheme()" /> 🌗 Dark Mode
            </label>
          </div>
          <div class="page-header"><strong>Welcome to Your Dream Machine</strong></div>
          <br/>
          <div class="subtitle">Type in your imagination and watch it come to life!</div>
          <form ng-submit="generateImage()">
            <input type="text" ng-model="prompt" placeholder="Describe your image..." required />
            <button type="submit">Generate Image</button>
          </form>
          <div class="loader" ng-show="loading">⏳ Generating image...</div>
        </div>

        <div class="content">
          <div class="image-container" ng-if="imageData">
            <img ng-src="{{imageData}}" alt="Generated Image" />
            <div>
              <button ng-click="downloadImage()">⬇️ Download</button>
              <button ng-click="shareImage()" ng-disabled="!canShare">📤 Share</button>
            </div>
          </div>
        </div>

        <script>
          angular.module('dreamApp', [])
            .controller('MyController', ['$scope', '$http', function($scope, $http) {
              $scope.prompt = "cyberpunk cat";
              $scope.loading = false;
              $scope.imageData = null;
              $scope.canShare = !!navigator.share;

              // Theme logic
              $scope.darkMode = false;
              $scope.theme = '';

              $scope.toggleTheme = function() {
                $scope.theme = $scope.darkMode ? 'dark-mode' : '';
              };

              $scope.generateImage = function() {
                $scope.loading = true;
                $scope.imageData = null;

                $http.get('/generate?prompt=' + encodeURIComponent($scope.prompt), {
                  responseType: 'arraybuffer'
                }).then(function(response) {
                  const blob = new Blob([response.data], { type: 'image/png' });
                  const url = URL.createObjectURL(blob);
                  const reader = new FileReader();
                  reader.onload = function(e) {
                    $scope.$apply(function() {
                      $scope.imageData = e.target.result;
                      $scope.blobUrl = url;
                      $scope.loading = false;
                    });
                  };
                  reader.readAsDataURL(blob);
                }).catch(function(err) {
                  console.error('Generation failed', err);
                  $scope.loading = false;
                });
              };

              $scope.downloadImage = function() {
                const a = document.createElement('a');
                a.href = $scope.imageData;
                a.download = "dream-image.png";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
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
      </html>
      `;
      return new Response(html, {
        headers: { "content-type": "text/html" },
      });
    }

    if (url.pathname === "/generate") {
      const prompt = url.searchParams.get("prompt") || "cyberpunk cat";

      const inputs = { prompt };

      const response = await env.AI.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        inputs,
      );

      return new Response(response, {
        headers: { "content-type": "image/png" },
      });
    }

    return new Response("404 Not Found", { status: 404 });
  },
}
