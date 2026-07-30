const sharp = require('sharp');
const path = require('path');

const imgPath = path.join(__dirname, 'public', 'images', 'ui', '_Image5.png');

async function run() {
  const { data, info } = await sharp(imgPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  
  const step = Math.max(1, Math.floor(width / 50));
  let pathPoints = [];
  
  for (let x = 0; x < width; x += step) {
    let sumY = 0;
    let count = 0;
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > 128) {
        sumY += y;
        count++;
      }
    }
    if (count > 0) {
      const avgY = sumY / count;
      pathPoints.push({ x: (x / width * 1000).toFixed(1), y: (avgY / height * 100).toFixed(1) });
    }
  }
  
  if (pathPoints.length > 0) {
    let d = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
    // Use Q curves for smoothness
    for (let i = 1; i < pathPoints.length - 1; i++) {
       const xc = (parseFloat(pathPoints[i].x) + parseFloat(pathPoints[i + 1].x)) / 2;
       const yc = (parseFloat(pathPoints[i].y) + parseFloat(pathPoints[i + 1].y)) / 2;
       d += ` Q ${pathPoints[i].x} ${pathPoints[i].y}, ${xc.toFixed(1)} ${yc.toFixed(1)}`;
    }
    const last = pathPoints[pathPoints.length - 1];
    d += ` T ${last.x} ${last.y}`;
    
    console.log("PATH:", d);
  } else {
    console.log("No visible pixels");
  }
}

run().catch(console.error);
