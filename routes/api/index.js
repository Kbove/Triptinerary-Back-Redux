const router = require('express').Router()
const userRoutes = require('./user-routes')
const itineraryRoutes = require('./itinerary-routes')

router.use('/users', userRoutes)
router.use('/itineraries', itineraryRoutes)

module.exports = router