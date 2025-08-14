import { CordovaAdapter } from './cordova';
import { ElectronAdapter } from './electron';
import type { IPlatform } from './type';
import { Platform } from 'quasar'; // Ensure Quasar types are available

export function createAdapter(): IPlatform {
  if (Platform.is.cordova) {
    return new CordovaAdapter();
  }
  if (Platform.is.electron) {
    return new ElectronAdapter();
  }
  throw new Error(`Unsupported platform: ${Platform.is.platform}`);
}
