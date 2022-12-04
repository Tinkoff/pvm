import express from 'express'

const router = express.Router()

router.get('/version', (_req, res) => {
  res.json({
    version: '11.6.0-ee',
  })
})

export default router
