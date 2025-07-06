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
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #f3f3f3;
          }
          .header {
            position: fixed;
            top: 0;
            width: 100%;
            background: #fff;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 1000;
            text-align: center;
          }
          .subtitle {
            font-size: 16px;
            color: #555;
          }
          .content {
            margin-top: 180px;
            text-align: center;
          }
          input[type="text"] {
            width: 300px;
            padding: 10px;
            font-size: 16px;
          }
          button {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
          }
          .loader {
            font-size: 20px;
            margin: 20px;
            display: none;
          }
          .image-container {
            margin-top: 30px;
            max-width: 90vw;
            max-height: 80vh;
            display: flex;
            justify-content: center;
          }
          img {
            max-width: 100%;
            height: auto;
            border: 1px solid #ccc;
            border-radius: 10px;
          }
        </style>
      </head>
      <body ng-app="dreamApp" ng-controller="MyController">
        <div class="header">
          <div class="page-header">Welcome to Your Dream Machine</div>
          <div class="subtitle">Type in your imagination and watch it come to life!</div>
          <form ng-submit="generateImage()">
            <input type="text" ng-model="prompt" placeholder="Describe your image..." required />
            <button type="submit">Generate Image</button>
          </form>
          <div class="loader" ng-show="loading">⏳ Generating image...</div>
        </div>

        <div class="content">
          <div class="image-container" ng-if="imageData">
            <img ng-src="{{imageData}}" alt="Generated image" />
          </div>
        </div>

        <script>
          angular.module('dreamApp', [])
            .controller('MyController', ['$scope', '$http', function($scope, $http) {
              $scope.prompt = "cyberpunk cat";
              $scope.loading = false;
              $scope.imageData = null;

              $scope.generateImage = function() {
                $scope.loading = true;
                $scope.imageData = null;

                $http.get('/generate?prompt=' + encodeURIComponent($scope.prompt), {
                  responseType: 'arraybuffer'
                }).then(function(response) {
                  const blob = new Blob([response.data], { type: 'image/png' });
                  const reader = new FileReader();
                  reader.onload = function(e) {
                    $scope.$apply(function() {
                      $scope.imageData = e.target.result;
                      $scope.loading = false;
                    });
                  };
                  reader.readAsDataURL(blob);
                }).catch(function(error) {
                  console.error('Image generation failed', error);
                  $scope.loading = false;
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
