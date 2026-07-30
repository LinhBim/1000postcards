const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const contentDir = path.join(process.cwd(), 'content', 'blog');
const files = fs.readdirSync(contentDir);

let count = 0;
for (const file of files) {
  if (file.endsWith('.md')) {
    const fullPath = path.join(contentDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    if (content.includes('đang chờ được viết')) {
      const parsed = matter(content);
      if (!parsed.data.isDraft) {
        parsed.data.isDraft = true;
        const newFileContent = matter.stringify(parsed.content, parsed.data);
        fs.writeFileSync(fullPath, newFileContent);
        count++;
        console.log(`Updated ${file}`);
      }
    }
  }
}

console.log(`Finished updating ${count} files.`);
