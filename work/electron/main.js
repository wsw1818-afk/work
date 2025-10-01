const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
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

  // 개발 모드: Next.js 서버에 연결
  // 여러 포트를 시도 (3000-3010)
  const tryPorts = [3000, 3001, 3002, 3003, 3004, 3005];
  let url = 'http://localhost:3000';

  // 환경 변수가 있으면 사용
  if (process.env.ELECTRON_START_URL) {
    url = process.env.ELECTRON_START_URL;
  } else {
    // 포트 3004부터 시도 (역순)
    url = 'http://localhost:3004';
  }

  console.log('Loading URL:', url);
  mainWindow.loadURL(url);

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
