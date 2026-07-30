const fs = require('fs');
const readline = require('readline');
const path = 'C:/Users/linhn/.gemini/antigravity/brain/92b79a54-7c87-4946-8672-f18610688198/.system_generated/logs/transcript_full.jsonl';

async function findWaiting() {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let bestMatch = '';

  for await (const line of rl) {
    if (line.toLowerCase().includes('waiting to be') && !line.includes('findWaiting.js') && !line.includes('findModal.js')) {
      try {
        const data = JSON.parse(line);
        let contentToSearch = '';
        
        if (data.content) contentToSearch += data.content;
        if (data.tool_calls) contentToSearch += JSON.stringify(data.tool_calls);
        
        const startIndex = contentToSearch.toLowerCase().indexOf('waiting to be');
        if (startIndex !== -1) {
           let sub = contentToSearch.substring(Math.max(0, startIndex - 1000), startIndex + 1000);
           sub = sub.replace(/\\n/g, '\n').replace(/\\"/g, '"');
           bestMatch = sub;
           break; // Stop at first true occurrence
        }
      } catch (e) {}
    }
  }
  
  if (bestMatch) {
    fs.writeFileSync('C:/Users/linhn/.gemini/antigravity/scratch/waiting.txt', bestMatch, 'utf-8');
    console.log('Found Waiting!');
  } else {
    console.log('Not found');
  }
}

findWaiting();
