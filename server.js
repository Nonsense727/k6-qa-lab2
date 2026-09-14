import http from 'node:http';

const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/slow') {
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('slow ok');
    }, 100);
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('fast ok');
});

server.listen(PORT, () => {
  console.log(`local server listening on http://localhost:${PORT}`);
});
