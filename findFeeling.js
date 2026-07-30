const fs = require('fs');
const readline = require('readline');
const path = 'C:/Users/linhn/.gemini/antigravity/brain/92b79a54-7c87-4946-8672-f18610688198/.system_generated/logs/transcript_full.jsonl';

async function findFeelingAnimation() {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let bestMatch = '';
  let maxLength = 0;

  for await (const line of rl) {
    if (line.includes('FeelingAnimation')) {
      try {
        const data = JSON.parse(line);
        let contentToSearch = '';
        
        if (data.content) {
          contentToSearch += data.content;
        }
        if (data.tool_calls) {
          contentToSearch += JSON.stringify(data.tool_calls);
        }
        
        const startIndex = contentToSearch.indexOf('const FeelingAnimation');
        if (startIndex !== -1) {
           let sub = contentToSearch.substring(startIndex, startIndex + 4000);
           sub = sub.replace(/\\n/g, '\n').replace(/\\"/g, '"');
           if (sub.includes('times:') && sub.length > maxLength) {
             maxLength = sub.length;
             bestMatch = sub;
           }
        }
      } catch (e) {}
    }
  }
  
  if (bestMatch) {
    fs.writeFileSync('C:/Users/linhn/.gemini/antigravity/scratch/feeling_anim.txt', bestMatch, 'utf-8');
    console.log('Found FeelingAnimation!');
  } else {
    console.log('Not found');
  }
}

findFeelingAnimation();
