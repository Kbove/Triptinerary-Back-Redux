const { Schema, model } = require('mongoose')

const ItinerarySchema = new Schema(
    {
        creator: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        image: {
            type: String,
            required: true
        },
        days: [
            {
                day_number: Number,
                activities: [
                    {
                        where: String,
                        what: String,
                        cost: String,
                    }
                ],
                city: String
            }
        ],
        purchaser_ids: [],
        ratings: [Number]
    }
)

const Itinerary = model('Itinerary', ItinerarySchema)

module.exports = Itinerary