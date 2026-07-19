import fs from 'fs/promises';
import path from 'path';

const contentDir = './content/blog';

async function exportToCSV() {
  const files = await fs.readdir(contentDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  const records = [];

  for (const file of mdFiles) {
    const fullPath = path.join(contentDir, file);
    const content = await fs.readFile(fullPath, 'utf8');
    
    // Extract frontmatter
    const titleMatch = content.match(/title:\s*"(.*?)"/);
    const title = titleMatch ? titleMatch[1] : '';
    
    const vibeMatch = content.match(/vibe:\s*"(.*?)"/);
    let vibe = vibeMatch ? vibeMatch[1] : '';
    
    const isPostcardMatch = content.match(/isPostcard:\s*(true|false)/);
    const isPostcard = isPostcardMatch && isPostcardMatch[1] === 'true';

    const coverMatch = content.match(/coverImage:\s*"(.*?)"/);
    const coverImage = coverMatch ? coverMatch[1] : '';

    let number = '';
    if (isPostcard) {
      const numMatch = title.match(/^(\d+)\s*\|/);
      if (numMatch) {
        number = numMatch[1];
      }
    }

    const isEmptyPlaceholder = content.includes('đang chờ được viết...');
    const hasContent = !isEmptyPlaceholder ? 'Yes' : 'No';

    // Format for CSV (handle commas in title)
    const safeTitle = `"${title.replace(/"/g, '""')}"`;
    const slug = file.replace('.md', '');

    if (isPostcard) {
      records.push(`${number},${safeTitle},${vibe},${coverImage},${hasContent},${slug}`);
    }
  }

  // Sort by number descending
  records.sort((a, b) => {
    const numA = parseInt(a.split(',')[0], 10) || 0;
    const numB = parseInt(b.split(',')[0], 10) || 0;
    return numB - numA;
  });

  const csvHeader = 'Number,Title,Vibes,Image Path,Has Content,Slug\n';
  const csvContent = csvHeader + records.join('\n');

  await fs.writeFile('./postcards_database.csv', csvContent, 'utf-8');
  console.log('Exported to postcards_database.csv');
}

exportToCSV().catch(console.error);
