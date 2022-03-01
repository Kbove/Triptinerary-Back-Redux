const router = require('express').Router()
const { User, Itinerary } = require('../../models')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const { authMiddleware, signToken } = require('../../utils/auth')
const auth = require('../../utils/auth')

router.get('/', async (req, res) => {
    try {
        const itineraries = await Itinerary.find({})
        res.json(itineraries)
    } catch (err) {
        res.status(400).json(err)
    }
})

router.get('/itinerary', async (req, res) => {
    try {
        const itineraries = await Itinerary.find({})
        res.json(itineraries)
    } catch (err) {
        res.status(400).json(err)
    }
})

router.get('/savedItinerary', authMiddleware, async ({ user }, res) => {
    try {
        const userItinerary = await User.findOne({ _id: user._id })
        const { saved_itinerary } = userItinerary
        const token = jwt.sign({ saved_itinerary }, process.env.TOKEN_SECRET, { expiresIn: '2h' })
        res.json({ saved_itinerary })
    } catch (err) {
        return res.status(400).json(err)
    }
})

router.post('/createItinerary', authMiddleware, async ({ user, body }, res) => {
    try {
        const newItinerary = await Itinerary.create(body)
        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { $addToSet: { saved_itinerary: newItinerary } },
            { new: true, runValidators: true }
        )
        return res.json({ newItinerary, updatedUser })
    } catch (err) {
        return res.status(400).json(err)
    }
})

router.post('/purchased', authMiddleware, async ({ user }, res) => {
    try {
        const itineraries = await User.findOne({ _id: user._id })
        const { purchased_itinerary, saved_itinerary } = itineraries
        const token = jwt.sign({ saved_itinerary }, process.env.TOKEN_SECRET, { expiresIn: '2h' })
        res.json({ purchased_itinerary, saved_itinerary })
    } catch (err) {
        return res.status(400).json(err)
    }
})

router.post('/searchCity', ({ body }, res) => {
    Itinerary.find({ days: { $elemMatch: { city: body.city } } }).collation({ locale: 'en', strength: 2 })
        .then(matchItinerary => {
            res.json(matchItinerary)
        }).catch(err => {
            res.status(400).json(err)
        })
})

router.post('/itinerary/:id', authMiddleware, async (req, res) => {
    try {
        const itinerary = await Itinerary.findOne({ _id: req.params.id })
        if (!itinerary) {
            return res.status(400).json('No matching itinerary')
        }
        res.json(itinerary)
    } catch (err) {
        res.json(err)
    }
})

router.put('/purchaseItinerary', authMiddleware, async ({ user, body }, res) => {
    try {
        const userClient = await User.findOne({ _id: user._id })
        const purchasedItinerary = await Itinerary.findOne({ _id: body._id })
        if (!userClient) {
            return res.status(400).json({ message: 'User not found' })
        }
        if (!purchasedItinerary) {
            return res.status(400).json({ message: 'Itinerary not found' })
        }

        const dupeCheck = await Itinerary.findOne({ _id: body._id })
        if (dupeCheck.purchaser_ids.indexOf(user._id) === -1) {        
        let finalPoints = userClient.points - purchasedItinerary.price
            if (finalPoints >= 0) {
                await User.findOneAndUpdate(
                    { _id: user._id },
                    { $set: { points: finalPoints }, $addToSet: { purchased_itinerary: purchasedItinerary } }
                )

                await Itinerary.findOneAndUpdate(
                    { _id: body._id },
                    { $addToSet: { purchaser_ids: user._id } }
                )
            } else {
                return res.json({ message: 'Not enough points' })
            }
            return res.json({ message: 'Successful transaction' })
        } else {
            return res.status(400).json({ message: 'You already own this'})
        }
    } catch (err) {
        return res.status(400).json(err)
    }
})


module.exports = router