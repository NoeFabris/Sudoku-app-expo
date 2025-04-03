#!/bin/bash

# Build the web app
npm run build:web

# Create necessary directories
mkdir -p dist/assets/images/pwa

# Copy PWA files to dist
cp web/manifest.webmanifest dist/
cp web/service-worker.js dist/

# Copy PWA icon assets
cp -r assets/images/pwa dist/assets/images/

# Set proper permissions for the icon files
chmod 644 dist/assets/images/pwa/*.png

# Insert PWA meta tags and service worker registration into all HTML files
for file in dist/*.html; do
  # Insert just before the closing head tag
  sed -i '' 's#</head>#<!-- iOS specific -->\n    <meta name="apple-mobile-web-app-capable" content="yes" />\n    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\n    <meta name="apple-mobile-web-app-title" content="Sudoku" />\n    \n    <!-- iOS icons -->\n    <link rel="apple-touch-icon" href="/assets/images/pwa/icon-192.png" />\n    <link rel="apple-touch-icon" sizes="152x152" href="/assets/images/pwa/icon-192.png" />\n    <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/pwa/icon-192.png" />\n    <link rel="apple-touch-icon" sizes="167x167" href="/assets/images/pwa/icon-192.png" />\n    \n    <!-- iOS splash screens -->\n    <link rel="apple-touch-startup-image" href="/assets/images/pwa/splash.png" />\n    \n    <!-- PWA manifest -->\n    <link rel="manifest" href="/manifest.webmanifest" />\n    \n    <script>\n      // Register service worker\n      if ("serviceWorker" in navigator) {\n        window.addEventListener("load", function() {\n          navigator.serviceWorker.register("/service-worker.js").then(\n            function(registration) {\n              console.log("ServiceWorker registration successful with scope: ", registration.scope);\n            },\n            function(err) {\n              console.log("ServiceWorker registration failed: ", err);\n            }\n          );\n        });\n      }\n    </script>\n</head>#g' "$file"
done

echo "PWA files copied and HTML files updated successfully" 