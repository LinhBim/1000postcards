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
    
    const parsed = matter(content);
    let changed = false;

    // Check if it's "ready to write"
    if (parsed.content.includes('đang chờ được viết')) {
      if (parsed.data.status !== 'ready-to-write') {
        parsed.data.status = 'ready-to-write';
        changed = true;
      }
    } else {
      // If no status yet, fallback to isDraft or default published
      if (!parsed.data.status) {
        parsed.data.status = parsed.data.isDraft ? 'draft' : 'published';
        changed = true;
      }
    }

    // Clean up isDraft field if it exists
    if (parsed.data.hasOwnProperty('isDraft')) {
      delete parsed.data.isDraft;
      changed = true;
    }

    if (changed) {
      const newFileContent = matter.stringify(parsed.content, parsed.data);
      fs.writeFileSync(fullPath, newFileContent);
      count++;
      console.log(`Migrated status for ${file}: ${parsed.data.status}`);
    }
  }
}

console.log(`Finished migrating ${count} files.`);
