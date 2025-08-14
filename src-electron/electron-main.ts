import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import os from 'os';
import { fileURLToPath } from 'url';
import { localPath, checkHotUpdate } from './hot-live-update';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

const currentDir = fileURLToPath(new URL('.', import.meta.url));

let mainWindow: BrowserWindow | undefined;

async function loadLocalPath() {
  const indexPath = path.join(localPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    await mainWindow!.loadFile(indexPath);
  } else {
    await mainWindow!.loadFile(path.join(__dirname, 'renderer/index.html'));
  }

  await mainWindow!.loadFile('index.html');
}

async function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        currentDir,
        path.join(
          process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
          'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
        ),
      ),
    },
  });

  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL);
  } else {
    await loadLocalPath();
  }

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

void app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    void createWindow();
  }
});

ipcMain.handle('fetch-posts', async () => {
  return axios.get('https://jsonplaceholder.typicode.com/posts').then(({ data }) => {
    return { posts: data };
  });
});
ipcMain.handle('print', async (event, content: string) => {
  const win = new BrowserWindow({ show: false });
  win.webContents.on('did-finish-load', () => {
    win.webContents.print({ silent: false, printBackground: true }, (success, errorType) => {
      console.log(success ? 'print success' : errorType);
    });
  });
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(content)}`);
});

ipcMain.handle('check-for-update', async () => {
  await checkHotUpdate();
  return await loadLocalPath();
});
