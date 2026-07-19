import fs from 'fs/promises';
import path from 'path';
import https from 'https';

const contentDir = './content/blog';
const localCsvPath = './postcards_database.csv';

// Nếu bạn đã có link Google Sheets (dạng CSV), bạn có thể dán vào biến dưới đây.
// Ví dụ: const googleSheetsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX.../pub?output=csv';
const googleSheetsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTRvXO4aiAdMR16noGNfxUF4Ccs3dqGPO_YCTpA6le-iGcz11pJDMFLYNmIo_28BTdbUxO2n5PCG3Ju/pub?output=csv'; 

async function downloadCSV(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download CSV: ${response.status} ${response.statusText}`);
  }
  return await response.text();
}

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

async function syncDatabase() {
  console.log('🔄 Bắt đầu đồng bộ dữ liệu...');

  let csvContent = '';
  if (googleSheetsUrl) {
    console.log('Tải dữ liệu từ Google Sheets...');
    try {
      csvContent = await downloadCSV(googleSheetsUrl);
    } catch (err) {
      console.error('Không thể tải từ Google Sheets, chuyển sang dùng file nội bộ:', err.message);
      csvContent = await fs.readFile(localCsvPath, 'utf8');
    }
  } else {
    console.log('Đọc dữ liệu từ file nội bộ (postcards_database.csv)...');
    try {
      csvContent = await fs.readFile(localCsvPath, 'utf8');
    } catch (err) {
      console.error('Không tìm thấy file postcards_database.csv!');
      process.exit(1);
    }
  }

  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    console.log('File CSV trống!');
    return;
  }

  const headers = parseCSVLine(lines[0]);
  const slugIndex = headers.findIndex(h => h.trim().toLowerCase() === 'slug');
  const vibeIndex = headers.findIndex(h => h.trim().toLowerCase().includes('vibe'));

  if (slugIndex === -1 || vibeIndex === -1) {
    console.error('Lỗi định dạng CSV: Không tìm thấy cột Slug hoặc Vibes');
    return;
  }

  let updatedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row = parseCSVLine(line);
    const slug = row[slugIndex];
    const newVibes = row[vibeIndex]; // Có thể là "colorful, chill"

    if (!slug) continue;

    const mdPath = path.join(contentDir, `${slug}.md`);
    try {
      let mdContent = await fs.readFile(mdPath, 'utf8');
      
      // Update vibe in frontmatter using regex
      // Tách các tag bằng dấu phẩy và loại bỏ khoảng trắng dư thừa
      const formattedVibes = newVibes.split(',').map(v => v.trim()).filter(v => v).join(', ');
      
      // Thay thế dòng vibe cũ bằng dòng vibe mới
      const newMdContent = mdContent.replace(/(vibe:\s*)"([^"]*)"/, `$1"${formattedVibes}"`);
      
      if (mdContent !== newMdContent) {
        await fs.writeFile(mdPath, newMdContent, 'utf8');
        updatedCount++;
      }
    } catch (err) {
      // Bỏ qua nếu không tìm thấy file markdown
    }
  }

  console.log(`✅ Đồng bộ thành công! Đã cập nhật ${updatedCount} bài viết.`);
}

syncDatabase().catch(console.error);
