export function getDefault(mod) {
  return (mod && mod.__esModule) ? mod.default || mod : mod
}

export function requireDefault(path) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return getDefault(require(path))
}
