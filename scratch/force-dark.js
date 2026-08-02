const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');

// Swap light and dark mode defaults temporarily
const lightModeVars = `--bg-color: #fcfbf9; /* Cream/Beige */
  --text-color: #2c2c2c;
  --accent-color: #8b7355;
  --card-bg: #ffffff;
  --card-border: #e0dcd3;
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  --transition-speed: 0.3s;`;

const darkModeVars = `--bg-color: #1a1a1a;
    --text-color: #e6e6e6;
    --accent-color: #d4b58e;
    --card-bg: #242424;
    --card-border: #333333;
    --font-heading: 'Playfair Display', serif;
    --font-body: 'Inter', sans-serif;
    --transition-speed: 0.3s;`;

// Replace default :root with dark mode
css = css.replace(
  /:root \{\r?\n\s*--bg-color: #fcfbf9;[\s\S]*?--transition-speed: 0\.3s;\r?\n\}/, 
  `:root {\n  ${darkModeVars}\n}`
);

// Replace media query with light mode
css = css.replace(
  /@media \(prefers-color-scheme: dark\) \{\r?\n\s*:root \{\r?\n\s*--bg-color: #1a1a1a;[\s\S]*?--card-border: #333333;\r?\n\s*\}\r?\n\}/,
  `@media (prefers-color-scheme: light) {\n  :root {\n  ${lightModeVars}\n  }\n}`
);

fs.writeFileSync('src/app/globals.css', css);
console.log('Swapped to Dark Mode default');
