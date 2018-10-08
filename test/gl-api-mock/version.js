const express = require('express')

const router = express.Router()

router.get('/version', (req, res) => {
  res.json({
    version: '11.6.0-ee',
  })
})

module.exports = router
