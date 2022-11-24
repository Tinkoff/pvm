
const valueRe = /{([^}]+)}/g

function replace(str, values, def = '') {
  return str.replace(valueRe, (_, name) => {
    return values[name] || def
  })
}

export default replace
