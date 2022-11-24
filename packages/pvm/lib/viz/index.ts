import Viz from 'viz.js'
import { Module, render } from 'viz.js/full.render.js'

let viz = new Viz({ Module, render })

async function renderDot(dot: string): Promise<string> {
  try {
    return viz.renderString(dot)
  } catch (e) {
    viz = new Viz({ Module, render })
    throw e
  }
}

export {
  renderDot,
}
