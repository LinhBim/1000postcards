const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const TurndownService = require('turndown');
const matter = require('gray-matter');

const turndownService = new TurndownService();

// Thay thế đường dẫn ảnh Weebly bằng đường dẫn ảnh public cục bộ
turndownService.addRule('image', {
    filter: 'img',
    replacement: function (content, node) {
        const src = node.getAttribute('src');
        if (src && src.startsWith('/uploads/')) {
            const fileName = path.basename(src);
            return `![Image](/images/postcards/${fileName})`;
        }
        return `![Image](${src})`;
    }
});

const csvContent = fs.readFileSync(path.join(__dirname, 'extracted_96', '96731bd8-6cdb-4f4b-9058-07b6645e3cbe', 'blog_post.csv'), 'utf8');

const records = parse(csvContent, {
    columns: false,
    skip_empty_lines: true
});

const outputDir = path.join(__dirname, '..', 'content', 'blog');
fs.mkdirSync(outputDir, { recursive: true });

records.forEach((record, index) => {
    if (record.length < 3) return;
    const title = record[0];
    const htmlContent = record[1];
    const slugFile = record[2];

    const slug = slugFile.replace('.html', '');
    const markdownContent = turndownService.turndown(htmlContent);

    // Vì csv export không có date chuẩn (có thể nằm ở bảng khác), ta tạm gán ngày
    const data = {
        title: title,
        slug: slug,
        date: `2019-01-${String(index+1).padStart(2, '0')}` // Ngày giả lập
    };

    const fileContent = matter.stringify(markdownContent, data);
    
    fs.writeFileSync(path.join(outputDir, `${slug}.md`), fileContent);
    console.log(`Created ${slug}.md`);
});

console.log('Finished converting to Markdown!');
