const router = require('express').Router()
const { User, Itinerary } = require('../../models')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const { authMiddleware, signToken } = require('../../utils/auth')
const auth = require('../../utils/auth')

router.get('/', (req, res) => {
        User.find({}).then(userData => {
            res.json(userData)
        }).catch(err => {
            res.json(err)
        })
})

router.post('/signup', ({body}, res) => {
    console.log('does this log')
    try {
        User.create(body)
        .then(data => {
            if (!data) {
                return res.status(400).json({message: 'Invalid user data'})
            }
            const token = signToken(data)
            console.log("token", token)
            res.json({token, data, newUser})
        })
    } catch (err) {
        return res.status(400).json(err)
    }
})



module.exports = router