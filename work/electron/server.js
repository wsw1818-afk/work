const path = require('path');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

let nextApp = null;
let server = null;

async function start() {
  if (server) {
    console.log('Next.js server already running');
    return;
  }

  const dev = false;
  const hostname = 'localhost';
  const port = 3000;

  // Next.js 앱 초기화
  const appDir = path.join(__dirname, '..');

  nextApp = next({
    dev,
    hostname,
    port,
    dir: appDir
  });

  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  // HTTP 서버 생성
  server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // 서버 시작
  await new Promise((resolve, reject) => {
    server.listen(port, hostname, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`> Ready on http://${hostname}:${port}`);
        resolve();
      }
    });
  });
}

async function stop() {
  if (server) {
    await nextApp.close();
    server.close();
    server = null;
    nextApp = null;
    console.log('Next.js server stopped');
  }
}

module.exports = { start, stop };
