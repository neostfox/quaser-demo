declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}
export interface ElectronAPI {
  fetchPosts: <T extends IArguments>(args: T) => Promise<unknown>;
  print: (content: string) => Promise<void>;
  checkHotUpdate: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
