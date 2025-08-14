import type { IPlatform } from './type';

export class CordovaAdapter implements IPlatform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  request<T, P>(args: P): Promise<T> {
    throw new Error('CordovaAdapter does not support request method. Use ElectronAdapter instead.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  print(content: string): Promise<void> {
    throw new Error('CordovaAdapter does not support request method. Use ElectronAdapter instead.');
  }
  checkForUpdate(): Promise<void> {
    throw new Error('CordovaAdapter does not support request method. Use ElectronAdapter instead.');
  }
}
