import fs from 'fs/promises';
import path from 'path';

const googleSheetsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQUYOnYkCKlhc8ZJiyZCAsC93VCtkkygvd_SE8zBqoQywoimCxIDelBYkl8K5Ci_Su9MCRZZbtspcLR/pub?output=csv'; 
const contentDir = './content/blog';

function parseCSVLine(text) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && text[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function fixMess() {
  console.log('Đang tải dữ liệu từ Google Sheets...');
  const response = await fetch(googleSheetsUrl);
  const csvContent = await response.text();
  
  const lines = csvContent.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  
  const fixedRecords = [];
  let updatedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    let row = parseCSVLine(lines[i].trim());
    
    // Nếu cột 4 là '/images/postcards/...' thì có nghĩa là dòng này bị xô lệch 1 cột
    if (row[4] && row[4].includes('/images/')) {
      // Cột 3 bị thừa (chữ chill), gộp nó vào cột 2 (Vibes)
      // Nhưng nếu user không muốn chữ chill, ta có thể bỏ qua nó, hoặc cứ gộp rồi user sửa lại. 
      // User bảo "không phải do t nha" -> ta xóa luôn chữ chill đó khỏi vibe.
      // Chỉ lấy row[2] làm vibes, bỏ row[3].
      row[3] = row[4]; // Đẩy Image Path về đúng vị trí
      row[4] = row[5]; // Đẩy Has Content về đúng vị trí
      row[5] = row[6]; // Đẩy Slug về đúng vị trí
      row.pop(); // Xóa cột thừa cuối cùng
    }
    
    const number = row[0];
    const title = row[1];
    let vibe = row[2];
    // Loại bỏ chữ "chill" nếu nó dính vào vibe (do mình đã chèn lúc test)
    if (vibe.includes('chill')) {
      vibe = vibe.replace(/,? ?chill/g, '').trim();
      row[2] = vibe;
    }
    const coverImage = row[3];
    const hasContent = row[4];
    const slug = row[5];

    // Cập nhật lại file Markdown
    if (slug) {
      const mdPath = path.join(contentDir, `${slug}.md`);
      try {
        let mdContent = await fs.readFile(mdPath, 'utf8');
        const formattedVibes = vibe.split(',').map(v => v.trim()).filter(v => v).join(', ');
        const newMdContent = mdContent.replace(/(vibe:\s*)"([^"]*)"/, `$1"${formattedVibes}"`);
        if (mdContent !== newMdContent) {
          await fs.writeFile(mdPath, newMdContent, 'utf8');
          updatedCount++;
        }
      } catch (err) {}
    }

    // Format lại để xuất CSV mới
    const safeTitle = `"${title.replace(/"/g, '""')}"`;
    const safeVibe = `"${vibe.replace(/"/g, '""')}"`;
    fixedRecords.push(`${number},${safeTitle},${safeVibe},${coverImage},${hasContent},${slug}`);
  }

  const csvHeader = 'Number,Title,Vibes,Image Path,Has Content,Slug\n';
  const newCsvContent = csvHeader + fixedRecords.join('\n');
  await fs.writeFile('./postcards_database.csv', newCsvContent, 'utf-8');
  
  console.log(`✅ Đã sửa lỗi xô lệch cột. Đã cập nhật ${updatedCount} bài viết Markdown.`);
}

fixMess().catch(console.error);
