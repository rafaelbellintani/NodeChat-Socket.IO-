const express = require('express')
const router = express.Router()

router.get('', (req,res) => {
    res.render('index')
})

router.post('/chat', (req,res) => {
    const { username, room } = req.body
    res.render('chat', {
        username,
        room
    })
})

module.exports = router