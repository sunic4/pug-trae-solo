// 简单的测试脚本，用于检查应用的状态和渲染结果
const http = require('http');

// 检查开发服务器是否正常运行
http.get('http://localhost:3000/', (res) => {
  console.log('Server status:', res.statusCode);
  console.log('Server headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Page content length:', data.length);
    console.log('Contains canvas element:', data.includes('<canvas id="app"'));
    console.log('Canvas width:', data.match(/width="(\d+)"/) ? data.match(/width="(\d+)"/)[1] : 'Not found');
    console.log('Canvas height:', data.match(/height="(\d+)"/) ? data.match(/height="(\d+)"/)[1] : 'Not found');
  });
}).on('error', (err) => {
  console.error('Error connecting to server:', err);
});
