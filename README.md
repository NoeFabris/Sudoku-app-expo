# Sudoku PWA

A Progressive Web App (PWA) version of the Sudoku game built with Expo and React Native.

## Features

- Fully functional on mobile and web
- Installable as a PWA on desktop and mobile
- Full offline support
- Responsive design

## Development

To run the development server:

```bash
npm run dev
```

## Building the PWA

To build the PWA for production:

```bash
npm run build:pwa
```

This will:
1. Build the web version of the app
2. Copy the necessary PWA files (manifest and service worker)
3. Update the HTML files with PWA-specific meta tags
4. Register the service worker

## Deployment

```bash
eas deploy --prod
```

To deploy the PWA:

1. Upload the contents of the `dist` directory to your web server
2. Ensure your web server is configured to serve the `manifest.webmanifest` file with the correct MIME type:
   - For Apache: Add `AddType application/manifest+json webmanifest` to your `.htaccess` file
   - For Nginx: Add `types { application/manifest+json webmanifest; }` to your server config

## Testing the PWA

You can test the PWA locally by running:

```bash
cd dist
python -m http.server 8000
```

Then visit http://localhost:8000 in your browser. For proper PWA testing, use Chrome and the Lighthouse tool to audit the PWA capabilities. 