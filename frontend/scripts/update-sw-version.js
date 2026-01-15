const fs = require('fs');
const path = require('path');

// 生成基于时间戳的版本号
const version = Date.now().toString();

// Service Worker 文件路径
const swPath = path.join(__dirname, '../public/service-worker.js');

try {
  // 读取 Service Worker 文件
  let swContent = fs.readFileSync(swPath, 'utf8');

  // 替换版本号占位符
  swContent = swContent.replace('__BUILD_TIME__', version);

  // 写回文件
  fs.writeFileSync(swPath, swContent, 'utf8');

  console.log(`✅ Service Worker version updated to: ${version}`);
} catch (error) {
  console.error('❌ Failed to update Service Worker version:', error);
  process.exit(1);
}
