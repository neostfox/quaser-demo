import type { IPlatform } from './type';

export class ElectronAdapter implements IPlatform {
  request<P>(args?: IArguments): Promise<P> {
    return window.electronAPI.fetchPosts(args as IArguments) as Promise<P>;
  }

  print(content: string): Promise<void> {
    return window.electronAPI.print(content);
  }
  checkForUpdate(): Promise<void> {
    return window.electronAPI.checkHotUpdate();
  }
}
