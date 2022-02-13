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
    try {
        User.create(body)
        .then(data => {
            if (!data) {
                return res.status(400).json({message: 'Invalid user data'})
            }
            const token = signToken(data)
            res.json({token, data})
        })
    } catch (err) {
        return res.status(400).json(err)
    }
})

router.post('/login', authMiddleware, async ({body}, res) => {
    try {
        const user = await User.findOne({ $or: [{username: body.username}, {email: body.email}]})
        if (!user) {
            return res.status(400).json({message: "Wrong username or password"})
        }
        const correctPw = await user.isCorrectPassword(body.password)
        if (!correctPw) {
            return res.status(400).json({message: "Wrong username or password"})
        }
        const token = signToken(user)
        res.json({token, user})
    } catch (err) {
        return res.status(400).json(err)
    }
})

router.post('/points', authMiddleware, async ({user}, res) => {
    try {
        const currentPoints = await User.findOne({_id: user._id})
        const { points } = currentPoints
        res.json({ points })
    } catch (err) {
        return res.status(400).json(err)
    }
})

router.put('/addPoints', authMiddleware, async ({user}, res) => {
    try {
        const currentUser = await User.findOne({_id: user._id})
        if (!currentUser) {
            return res.status(400).json({message: 'User not found'})
        } 
        let newPoints = currentUser.points += 10
        await User.findOneAndUpdate(
            {_id: user._id},
            {$set: {points: newPoints}}
        )
        res.json({ message: 'Points added!'})
    } catch (err) {
        return res.status(400).json(err)
    }
})

module.exports = router