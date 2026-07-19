const fs = require('fs');
const https = require('https');
const path = require('path');

const csvContent = fs.readFileSync(path.join(__dirname, 'extracted_96', '96731bd8-6cdb-4f4b-9058-07b6645e3cbe', 'blog_post.csv'), 'utf8');

const regex = /<img src=""([^""]+)""/g;
let match;
const urls = [];

while ((match = regex.exec(csvContent)) !== null) {
    if(match[1] && match[1].startsWith('/')) {
        urls.push(match[1]);
    }
}

const uniqueUrls = [...new Set(urls)];
console.log(`Found ${uniqueUrls.length} unique images to download.`);

const downloadDir = path.join(__dirname, '..', 'public', 'images', 'postcards');
fs.mkdirSync(downloadDir, { recursive: true });

function downloadImage(urlPath) {
    const fullUrl = `https://1000postcards.weebly.com${urlPath}`;
    const fileName = path.basename(urlPath);
    const destination = path.join(downloadDir, fileName);
    
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        }
    };
    return new Promise((resolve, reject) => {
        https.get(fullUrl, options, (res) => {
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(destination);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(fileName);
                });
            } else {
                reject(new Error(`Failed to download ${fullUrl}, status code: ${res.statusCode}`));
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function run() {
    for (const urlPath of uniqueUrls) {
        try {
            const name = await downloadImage(urlPath);
            console.log(`Downloaded: ${name}`);
        } catch (e) {
            console.error(e.message);
        }
    }
    console.log("Done downloading images!");
}

run();
