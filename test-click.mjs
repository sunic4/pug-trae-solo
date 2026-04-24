// 测试脚本
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 创建一个简单的 HTTP 服务器
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const html = fs.readFileSync(path.join(__dirname, 'test-click.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (req.url.startsWith('/packages/')) {
    const filePath = path.join(__dirname, req.url);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(content);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  } else if (req.url.startsWith('/apps/')) {
    const filePath = path.join(__dirname, req.url);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(content);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// 启动服务器
const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}/`);
  console.log('Open this URL in your browser to test the click functionality');
});

// 运行 30 秒后自动关闭
setTimeout(() => {
  server.close();
  console.log('Test server closed');
}, 30000);