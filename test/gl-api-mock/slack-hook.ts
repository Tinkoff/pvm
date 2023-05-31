import express from 'express'

const router = express.Router()

router.post('/', (req, res) => {
  console.log('slack-hook:', req.body.text)
  res.json({ ok: true, body: req.body })
})

export default router
