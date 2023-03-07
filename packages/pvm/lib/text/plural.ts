
function interpolate(str: string, ...args: any[]): string {
  return str.replace(/%(\d)/g, (_, offset: string) => {
    const offsetNum = Number(offset)
    return args[offsetNum - 1] || ''
  })
}

export function enpl(forms: string[], count: number, ...args: any[]): string {
  if (count === 0) {
    return interpolate(forms[0], count, ...args)
  } else if (count === 1) {
    return interpolate(forms[1], count, ...args)
  } else {
    return interpolate(forms[2], count, ...args)
  }
}
