const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: '가계부',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  let url;

  if (app.isPackaged) {
    // 프로덕션 모드: Next.js 내장 서버 시작
    const nextServer = require('./server.js');
    await nextServer.start();
    url = 'http://localhost:3000';
  } else {
    // 개발 모드: 외부 Next.js 서버에 연결
    url = process.env.ELECTRON_START_URL || 'http://localhost:3000';
  }

  console.log('Loading URL:', url);

  // 개발 모드에서는 Next.js 서버가 준비될 때까지 재시도
  if (!app.isPackaged) {
    let retries = 0;
    const maxRetries = 10;
    const retryDelay = 1000;

    while (retries < maxRetries) {
      try {
        await mainWindow.loadURL(url);
        console.log('Successfully loaded:', url);
        break;
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          console.error('Failed to load URL after', maxRetries, 'attempts');
          throw error;
        }
        console.log(`Retry ${retries}/${maxRetries} after ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  } else {
    await mainWindow.loadURL(url);
  }

  // 개발 모드에서만 DevTools 열기
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
