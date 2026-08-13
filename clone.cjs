const fs = require('fs');

let html = fs.readFileSync('/tmp/timetablecreator.html', 'utf8');
const css = fs.readFileSync('/tmp/styles.css', 'utf8');
let js = fs.readFileSync('/tmp/app.js', 'utf8');

html = html.replace(/\/images\/logo\.png/g, 'https://www.timetablecreator.com/images/logo.png');
html = html.replace(/\/favicon_io\//g, 'https://www.timetablecreator.com/favicon_io/');
html = html.replace('<link rel="stylesheet" href="/css/styles.css">', `<style>\n${css}\n</style>`);
html = html.replace('<script src="app.js"></script>', `<script>\n${js}\n</script>`);

fs.writeFileSync('index.html', html);
console.log('Cloned successfully');
