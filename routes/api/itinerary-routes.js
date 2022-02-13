const router = require('express').Router()
const { User, Itinerary } = require('../../models')
const jwt = require('jsonwebtoken')
require('dotenv').config()

router.get('/itineraries', async (req, res) => {
    try {
        const itineraries = await Itinerary.find({})
        res.json(itineraries)
    } catch (err) {
        res.status(400).json(err)
    }
})

router.post('/searchcity', ({body}, res) => {
    Itinerary.find({ days: {$elemMatch: {city: body.city}}}).collation({locale: 'en', strength: 2})
    .then(matchItinerary => {
        res.json(matchItinerary)
    }).catch(err => {
        res.status(400).json(err)
    })
})



module.exports = router