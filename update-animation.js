// Script to update data.json to include all 287 frames
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'public', 'animations', 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Update op (out point) to 287
data.op = 287;

// Current assets count
const currentAssets = data.assets.length; // Should be 215
console.log(`Current assets: ${currentAssets}`);

// Add missing assets (216 to 287)
for (let i = currentAssets; i < 287; i++) {
  const frameNum = i + 1;
  const paddedNum = String(frameNum).padStart(4, '0');
  
  data.assets.push({
    id: `image_${i}`,
    w: 3840,
    h: 2160,
    u: "images/",
    p: `out_${paddedNum}.webp`,
    e: 0
  });
}

// Current layers count
const currentLayers = data.layers.length;
console.log(`Current layers: ${currentLayers}`);

// Add missing layers (216 to 287)
for (let i = currentLayers; i < 287; i++) {
  const frameNum = i + 1;
  const paddedNum = String(frameNum).padStart(4, '0');
  
  data.layers.push({
    ddd: 0,
    ind: i + 1,
    ty: 2,
    nm: `out_${paddedNum}.webp`,
    cl: "webp",
    refId: `image_${i}`,
    sr: 1,
    ks: {
      p: {
        a: 0,
        k: [1920.0, 1080.0, 0]
      },
      a: {
        a: 0,
        k: [1920.0, 1080.0, 0]
      }
    },
    ao: 0,
    ip: i,
    op: i + 1,
    st: i,
    bm: 0
  });
}

console.log(`New assets count: ${data.assets.length}`);
console.log(`New layers count: ${data.layers.length}`);
console.log(`New op (end frame): ${data.op}`);

// Write back to file
fs.writeFileSync(dataPath, JSON.stringify(data, null, 0), 'utf8');
console.log('✅ Successfully updated data.json with all 287 frames!');
