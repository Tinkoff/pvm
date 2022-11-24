import glapi from './index'

async function version() {
  const { json } = await glapi('/version')
  return json
}

export default version
