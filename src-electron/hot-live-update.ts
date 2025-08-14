import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import AdmZip from 'adm-zip';
import os from 'os';
export const localPath = path.join(app.getPath('userData'), 'renderer');
const tmpPath = path.join(os.tmpdir(), 'myapp_update.zip');

export async function checkHotUpdate() {
  try {
    // 1️⃣ 获取远程版本信息
    const { data } = await axios.get(
      'https://raw.githubusercontent.com/neostfox/quaser-demo/refs/heads/master/version.json',
    );
    const remoteVersion = data.version;

    // 2️⃣ 获取本地版本
    const localVersionFile = path.join(localPath, 'version.json');
    let localVersion = '0.0.0';
    if (fs.existsSync(localVersionFile)) {
      localVersion = JSON.parse(fs.readFileSync(localVersionFile, 'utf-8')).version;
    }

    if (remoteVersion !== localVersion) {
      console.log('发现新版本资源，开始下载 zip 文件...');

      // 3️⃣ 下载 zip 文件
      const zipRes = await axios.get(
        `https://raw.githubusercontent.com/neostfox/quaser-demo/refs/heads/master/update.zip`,
        { responseType: 'arraybuffer' },
      );
      fs.writeFileSync(tmpPath, Buffer.from(zipRes.data));

      // 4️⃣ 解压到临时目录
      const tmpExtractDir = path.join(app.getPath('userData'), 'renderer_tmp');
      if (fs.existsSync(tmpExtractDir)) fs.rmSync(tmpExtractDir, { recursive: true, force: true });
      fs.mkdirSync(tmpExtractDir, { recursive: true });

      const zip = new AdmZip(tmpPath);
      zip.extractAllTo(tmpExtractDir, true);

      // 5️⃣ 事务式替换：先备份旧版本
      const backupDir = path.join(app.getPath('userData'), 'renderer_backup');
      if (fs.existsSync(localPath)) {
        if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true, force: true });
        fs.renameSync(localPath, backupDir);
      }

      // 6️⃣ 移动新版本到正式目录
      fs.renameSync(tmpExtractDir, localPath);

      // 7️⃣ 保存新版本号
      fs.writeFileSync(localVersionFile, JSON.stringify({ version: remoteVersion }));

      console.log('热更新完成');
      // 可选：删除备份
      if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true, force: true });
    } else {
      console.log('已经是最新资源');
    }
  } catch (err) {
    console.error('热更新失败，尝试回滚旧版本', err);
    // 回滚
    const backupDir = path.join(app.getPath('userData'), 'renderer_backup');
    if (fs.existsSync(backupDir)) {
      if (fs.existsSync(localPath)) fs.rmSync(localPath, { recursive: true, force: true });
      fs.renameSync(backupDir, localPath);
    }
  }
}
