const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'src', 'app', 'icon.png');
const outputPath = path.join(__dirname, '..', 'src', 'app', 'icon-optimized.png');

console.log('画像を最適化中...');

sharp(inputPath)
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ quality: 90, compressionLevel: 9 })
  .toFile(outputPath)
  .then(info => {
    console.log('✅ 最適化完了:', info);
    console.log(`元のサイズ: 1.4MB → 最適化後: ${(info.size / 1024).toFixed(1)}KB`);
    console.log('\n次のステップ:');
    console.log('1. 元のファイルを削除: rm src/app/icon.png');
    console.log('2. 最適化版をリネーム: mv src/app/icon-optimized.png src/app/icon.png');
  })
  .catch(err => console.error('❌ エラー:', err));
