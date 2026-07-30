const fs = require('fs');
const filePath = 'src/app/archives/ArchivesClient.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const match = content.match(/<path id="wavyPath" d="([^"]+)" fill="transparent" \/>/);
if (match) {
   let pathStr = match[1];
   let parts = pathStr.split(' ');
   for (let i=0; i<parts.length; i++) {
      if (parts[i] === 'M' || parts[i] === 'T') {
         let y = parseFloat(parts[i+2]);
         parts[i+2] = (y + 17.5).toFixed(1);
         i += 2;
      } else if (parts[i] === 'Q') {
         let y1 = parseFloat(parts[i+2].replace(',', ''));
         let y2 = parseFloat(parts[i+4]);
         parts[i+2] = (y1 + 17.5).toFixed(1) + ',';
         parts[i+4] = (y2 + 17.5).toFixed(1);
         i += 4;
      }
   }
   const finalPath = parts.join(' ');
   console.log(finalPath);
} else {
   console.log('Path not found');
}
