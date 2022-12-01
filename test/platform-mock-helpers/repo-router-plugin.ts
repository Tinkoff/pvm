import fs from 'fs'
import path from 'path'
import { dataFor } from '../git/data'

export default function repoRouterPlugin(router: any) {
  router.param('id', function(req: any, res: any, next: any) {
    const { reposDir } = req.app.locals

    res.locals.repoDir = path.join(reposDir, req.params.id)
    res.locals.repoData = dataFor(res.locals.repoDir)

    if (!fs.existsSync(res.locals.repoDir)) {
      next(new Error(`There is no directory ${res.locals.repoDir}`))
    } else {
      next()
    }
  })
}
