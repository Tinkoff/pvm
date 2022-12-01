export function getDefault(mod: any) {
  return (mod && mod.__esModule) ? mod.default || mod : mod
}

export function requireDefault(path: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return getDefault(require(path))
}
