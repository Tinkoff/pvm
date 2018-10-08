const express = require('express')

const router = express.Router()

router.post('/', (req, res) => {
  console.log('slack-hook:', req.body.text)
  res.json({ ok: true, body: req.body })
})

module.exports = router
