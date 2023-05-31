
function resolvePreset(preset: ((cb: (err: any, result: any) => void) => Record<string, any>) | Record<string, any>): Record<string, any> {
  if (typeof preset === 'function') {
    return new Promise((resolve, reject) => {
      preset((err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  } else {
    return Promise.resolve(preset)
  }
}

export default resolvePreset
