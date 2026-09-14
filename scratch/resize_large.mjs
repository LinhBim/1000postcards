import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function run() {
  const dir = path.join(process.cwd(), 'public/images/postcards');
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    if (stats.size > 9 * 1024 * 1024) { // > 9MB
      console.log('Resizing ' + file + ' (' + (stats.size / 1024 / 1024).toFixed(2) + ' MB)');
      const tempPath = fullPath + '.tmp.jpg';
      await sharp(fullPath).jpeg({ quality: 80 }).toFile(tempPath);
      fs.renameSync(tempPath, fullPath);
      console.log('Resized ' + file);
    }
  }
}
run();
