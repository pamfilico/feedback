const fs = require('fs');
const path = require('path');

const storybookStaticPath = path.join(__dirname, '..', 'storybook-static');

// Add .nojekyll file
fs.writeFileSync(path.join(storybookStaticPath, '.nojekyll'), '');
console.log('Created .nojekyll file');

// Fix iframe.html to use correct base path
const iframePath = path.join(storybookStaticPath, 'iframe.html');
if (fs.existsSync(iframePath)) {
  let iframeContent = fs.readFileSync(iframePath, 'utf8');
  // Add base tag for GitHub Pages subdirectory
  iframeContent = iframeContent.replace(
    '<head>',
    '<head>\n  <base href="/feedback/">'
  );
  fs.writeFileSync(iframePath, iframeContent);
  console.log('Fixed iframe.html with base href');
}

// Fix index.html
const indexPath = path.join(storybookStaticPath, 'index.html');
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  indexContent = indexContent.replace(
    '<head>',
    '<head>\n  <base href="/feedback/">'
  );
  fs.writeFileSync(indexPath, indexContent);
  console.log('Fixed index.html with base href');
}
