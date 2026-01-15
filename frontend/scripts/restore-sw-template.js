const fs = require('fs');
const path = require('path');

// Service Worker 文件路径
const swPath = path.join(__dirname, '../public/service-worker.js');

try {
  // 读取 Service Worker 文件
  let swContent = fs.readFileSync(swPath, 'utf8');

  // 将版本号替换回占位符（用于开发环境）
  swContent = swContent.replace(/const CACHE_VERSION = '.*?';/, "const CACHE_VERSION = '__BUILD_TIME__';");

  // 写回文件
  fs.writeFileSync(swPath, swContent, 'utf8');

  console.log('✅ Service Worker template restored');
} catch (error) {
  console.error('❌ Failed to restore Service Worker template:', error);
  process.exit(1);
}
