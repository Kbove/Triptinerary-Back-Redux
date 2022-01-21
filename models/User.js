const { Schema, model } = require('mongoose')
const bcrypt = require('bcrypt')

const { ItinerarySchema } = require('./Itinerary')

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true, 
            unique: true,
            match: [/.+@.+\..+/, 'Must use a valid email address']
        },
        password: {
            type: String,
            required: true,
        },
        points: {
            type: Number,
            required: true,
            default: 0
        },
        saved_itinerary: {
            type: Array, 
            'default': [{ItinerarySchema}]
        },
        purchased_itinerary: {
            type: Array,
            'default': [{ItinerarySchema}]
        },
    },
    {
        toJSON: {
            virtuals: true,
        },
    }
)

UserSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds)
    }
    next()
})

UserSchema.methods.isCorrectPassword = async function (password) {
    return bcrypt.compare(password, this.password)
}

const User = model('User', UserSchema)

module.exports = User