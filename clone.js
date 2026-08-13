const fs = require('fs');

let html = fs.readFileSync('/tmp/timetablecreator.html', 'utf8');
const css = fs.readFileSync('/tmp/styles.css', 'utf8');
let js = fs.readFileSync('/tmp/app.js', 'utf8');

// Replace relative logo path
html = html.replace(/\/images\/logo\.png/g, 'https://www.timetablecreator.com/images/logo.png');

// Replace favicon paths
html = html.replace(/\/favicon_io\//g, 'https://www.timetablecreator.com/favicon_io/');

// Replace CSS
html = html.replace('<link rel="stylesheet" href="/css/styles.css">', `<style>\n${css}\n</style>`);

// Fix JS (the api endpoints)
// We might just want to leave them to fail gracefully, or point them to the original site (CORS might block)
// js = js.replace(/api\.php/g, 'https://www.timetablecreator.com/api.php');
// js = js.replace(/\/feature-request\.php/g, 'https://www.timetablecreator.com/feature-request.php');

// Replace JS
html = html.replace('<script src="app.js"></script>', `<script>\n${js}\n</script>`);

fs.writeFileSync('index.html', html);
console.log('Cloned successfully');
