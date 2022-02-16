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

router.post('/me', authMiddleware, ({user}, res) => {
    User.find({_id: user._id})
    .then(myData => {
        res.json(myData)
    }).catch(err => {
        console.log(err)
    })
})

router.post('/signup', async ({ body }, res) => {
    try {
      User.create(body)
        .then(data => {
          if (!data) {
            return res.status(400).json({ message: 'Something is wrong!' });
          }
          const token = signToken(data);
          console.log('token', token)
          res.json({ token, data });
        })
    } catch (err) {
      console.log(err)
      return res.status(400).json(err);
    }
  })

  router.post('/login', async ({ body }, res) => {
    try {
      const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] })
      if (!user) {
        return res.status(400).json({ message: "Wrong username or password" });
      }
      const correctPw = await user.isCorrectPassword(body.password);
      console.log(correctPw)
      if (!correctPw) {
        return res.status(400).json({ message: 'Wrong username or password' });
      }
      const token = signToken(user);
      res.json({ token, user });
    } catch (err) {
      console.log(err)
      return res.status(400).json(err);
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

router.put('/rateItinerary', authMiddleware, async ({body}, res) => {
    const { rating, _id } = body
    try {
        const ratingItinerary = await Itinerary.findOne({ _id: body._id})
        if (!ratingItinerary) {
            return res.status(400).json({message: 'Itinerary not found'})
        }
        const nametest = await Itinerary.findOneAndUpdate(
            body._id,
            { $push: {ratings: rating}}
        )
        res.json(nametest)
    } catch (err) {
        return res.status(400).json(err)
    }
})

module.exports = router