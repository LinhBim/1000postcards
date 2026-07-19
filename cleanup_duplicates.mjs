import fs from 'fs/promises';
import path from 'path';

const contentDir = './content/blog';

async function cleanupDuplicates() {
  const files = await fs.readdir(contentDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  const parsedPosts = [];

  for (const file of mdFiles) {
    const fullPath = path.join(contentDir, file);
    const content = await fs.readFile(fullPath, 'utf8');
    
    // Simple regex to extract title and check for placeholder text
    const titleMatch = content.match(/title:\s*"(.*?)"/);
    const title = titleMatch ? titleMatch[1] : '';
    
    const isPostcard = /^\d+\s*\|/.test(title);
    let number = null;
    if (isPostcard) {
      const numMatch = title.match(/^(\d+)\s*\|/);
      if (numMatch) {
        number = numMatch[1];
      }
    }

    const isEmptyPlaceholder = content.includes('đang chờ được viết...');

    if (number) {
      parsedPosts.push({
        file,
        fullPath,
        number,
        isEmptyPlaceholder
      });
    }
  }

  // Group by number
  const groups = {};
  for (const post of parsedPosts) {
    if (!groups[post.number]) groups[post.number] = [];
    groups[post.number].push(post);
  }

  let deletedCount = 0;

  for (const [number, postsInGroup] of Object.entries(groups)) {
    if (postsInGroup.length > 1) {
      // Check if there's at least one that is NOT a placeholder (has real text)
      const hasRealText = postsInGroup.some(p => !p.isEmptyPlaceholder);
      
      if (hasRealText) {
        // Delete all placeholders in this group
        for (const post of postsInGroup) {
          if (post.isEmptyPlaceholder) {
            console.log(`Deleting duplicate placeholder for postcard ${number}: ${post.file}`);
            await fs.unlink(post.fullPath);
            deletedCount++;
          }
        }
      } else {
        // All are placeholders, just keep one (the first one)
        for (let i = 1; i < postsInGroup.length; i++) {
          const post = postsInGroup[i];
          console.log(`Deleting extra placeholder for postcard ${number}: ${post.file}`);
          await fs.unlink(post.fullPath);
          deletedCount++;
        }
      }
    }
  }

  console.log(`Cleanup complete. Deleted ${deletedCount} duplicate files.`);
}

cleanupDuplicates().catch(console.error);
