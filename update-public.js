const fs = require('fs');
const path = require('path');

const contentDir = path.join('C:\\Users\\linhn\\.gemini\\antigravity\\scratch\\postcards-web', 'content', 'blog');
const files = fs.readdirSync(contentDir);

let count = 0;
for (const file of files) {
  if (file.endsWith('.md')) {
    const fullPath = path.join(contentDir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if it has status: draft or status: ready-to-write
    if (content.includes('status: draft') || content.includes('status: ready-to-write')) {
      // Replace with status: public
      content = content.replace(/status:\s*(draft|ready-to-write)/g, 'status: public');
      fs.writeFileSync(fullPath, content);
      count++;
    }
  }
}

console.log('Finished updating ' + count + ' files to public.');
