import fs from 'fs'
import path from 'path'
import { dataFor } from '../git/data'

export default function repoRouterPlugin(router: any) {
  router.param('id', function(req: any, res: any, next: any) {
    const { reposDir } = req.app.locals

    res.app.locals.repoDir = path.join(reposDir, req.params.id)
    res.app.locals.repoData = dataFor(res.app.locals.repoDir)

    if (!fs.existsSync(res.app.locals.repoDir)) {
      next(new Error(`There is no directory ${res.app.locals.repoDir}`))
    } else {
      next()
    }
  })
}
