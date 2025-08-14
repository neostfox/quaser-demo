export interface IPlatform {
  request: <P>(args?: IArguments) => Promise<P>;
  print: (content: string) => Promise<void>;
  checkForUpdate: () => Promise<void>;
}
