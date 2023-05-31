export function cmdOption(name: string, value?: string | number): string {
  return value !== undefined ? `--${name} "${value}"` : ''
}
