const fs = require('fs');
const readline = require('readline');
const path = 'C:/Users/linhn/.gemini/antigravity/brain/92b79a54-7c87-4946-8672-f18610688198/.system_generated/logs/transcript_full.jsonl';

async function findPick() {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let bestMatch = '';

  for await (const line of rl) {
    if (line.toLowerCase().includes('pick another') && !line.includes('findPick.js')) {
      try {
        const data = JSON.parse(line);
        let contentToSearch = '';
        
        if (data.content) contentToSearch += data.content;
        if (data.tool_calls) contentToSearch += JSON.stringify(data.tool_calls);
        
        const startIndex = contentToSearch.toLowerCase().indexOf('pick another');
        if (startIndex !== -1) {
           let sub = contentToSearch.substring(Math.max(0, startIndex - 2000), startIndex + 3000);
           sub = sub.replace(/\\n/g, '\n').replace(/\\"/g, '"');
           bestMatch = sub;
           break; // Stop at first true occurrence
        }
      } catch (e) {}
    }
  }
  
  if (bestMatch) {
    fs.writeFileSync('C:/Users/linhn/.gemini/antigravity/scratch/pick.txt', bestMatch, 'utf-8');
    console.log('Found Pick!');
  } else {
    console.log('Not found');
  }
}

findPick();
