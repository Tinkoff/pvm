
const valueRe = /{([^}]+)}/g

function replace(str: string, values: Record<string, string>, def = '') {
  return str.replace(valueRe, (_, name) => {
    return values[name] || def
  })
}

export default replace
