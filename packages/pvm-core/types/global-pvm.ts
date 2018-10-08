export {}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      argv?: Record<string, any>,
    }
  }
}
