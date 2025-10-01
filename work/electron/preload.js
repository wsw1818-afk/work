const { contextBridge } = require('electron');

// 필요한 경우 안전한 API만 노출
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform
});
