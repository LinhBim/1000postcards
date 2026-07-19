import fs from 'fs/promises';
import path from 'path';

const sourceDir = './incoming_postcards';
const targetDir = './public/images/postcards';
const contentDir = './content/blog';
const vibes = ['breathing', 'colorful', 'fun'];

async function processFile(file) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    // Copy ảnh sang thư mục public
    try {
      await fs.access(targetPath);
    } catch {
      await fs.copyFile(sourcePath, targetPath);
    }

    // Sinh file Markdown
    const numMatch = file.match(/^(\d+)/);
    const num = numMatch ? parseInt(numMatch[1], 10) : Math.floor(Math.random() * 1000) + 2000;
    
    const slug = `${num}-postcard`;
    const mdPath = path.join(contentDir, `${slug}.md`);
    
    const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];
    
    const mdContent = `---
title: "${num} | Postcard"
date: "${new Date().toISOString().split('T')[0]}"
isPostcard: true
coverImage: "/images/postcards/${file}"
vibe: "${randomVibe}"
---

![Postcard ${num}](/images/postcards/${file})

*Nội dung cho Postcard số ${num} đang chờ được viết...*
`;

    try {
      await fs.access(mdPath);
      return 0;
    } catch {
      await fs.writeFile(mdPath, mdContent, 'utf-8');
      return 1;
    }
}

async function exportToCSV() {
  const files = await fs.readdir(contentDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  const records = [];

  for (const file of mdFiles) {
    const fullPath = path.join(contentDir, file);
    const content = await fs.readFile(fullPath, 'utf8');
    
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
    const safeTitle = `"${title.replace(/"/g, '""')}"`;
    const slug = file.replace('.md', '');

    if (isPostcard) {
      records.push(`${number},${safeTitle},${vibe},${coverImage},${hasContent},${slug}`);
    }
  }

  records.sort((a, b) => {
    const numA = parseInt(a.split(',')[0], 10) || 0;
    const numB = parseInt(b.split(',')[0], 10) || 0;
    return numB - numA; // Sắp xếp giảm dần
  });

  const csvHeader = 'Number,Title,Vibes,Image Path,Has Content,Slug\n';
  const csvContent = csvHeader + records.join('\n');
  await fs.writeFile('./postcards_database.csv', csvContent, 'utf-8');
}

async function importPostcards() {
  console.log('🔄 Đang kiểm tra thư mục incoming_postcards...');
  
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.mkdir(targetDir, { recursive: true });
  await fs.mkdir(contentDir, { recursive: true });

  const files = await fs.readdir(sourceDir);
  const imageFiles = files.filter(f => f.match(/\.(jpe?g|png)$/i));

  if (imageFiles.length === 0) {
    console.log('Không có ảnh mới nào trong thư mục incoming_postcards!');
    return;
  }

  let count = 0;
  for (const file of imageFiles) {
    count += await processFile(file);
    // Xóa ảnh gốc sau khi đã copy thành công vào thư mục public để dọn dẹp
    await fs.unlink(path.join(sourceDir, file));
  }

  console.log(`✅ Đã tự động tạo ${count} bài viết Postcards mới!`);
  
  console.log('🔄 Đang cập nhật lại file postcards_database.csv...');
  await exportToCSV();
  console.log('✅ File postcards_database.csv đã được cập nhật!');
  console.log('👉 BƯỚC TIẾP THEO: Hãy mở file postcards_database.csv, copy các dòng dữ liệu mới và dán nối tiếp vào Google Sheets của bạn nhé!');
}

importPostcards().catch(console.error);
