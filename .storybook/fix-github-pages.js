const fs = require('fs');
const path = require('path');

const storybookStaticPath = path.join(__dirname, '..', 'storybook-static');

// Add .nojekyll file to bypass Jekyll processing
fs.writeFileSync(path.join(storybookStaticPath, '.nojekyll'), '');
console.log('Created .nojekyll file');

// Fix MSW service worker preload path in iframe.html
const iframeHtmlPath = path.join(storybookStaticPath, 'iframe.html');
let iframeHtml = fs.readFileSync(iframeHtmlPath, 'utf8');
iframeHtml = iframeHtml.replace(
  /<link rel="preload" href="\/mockServiceWorker\.js" as="script">/g,
  '<link rel="preload" href="./mockServiceWorker.js" as="script">'
);
fs.writeFileSync(iframeHtmlPath, iframeHtml);
console.log('Fixed MSW service worker preload path in iframe.html');

console.log('GitHub Pages setup complete');
