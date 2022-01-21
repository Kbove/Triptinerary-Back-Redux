const jwt = require('jsonwebtoken')
require('dotenv').config()

const expiration = '2h'

module.exports = {
    authMiddleware: function (req, res, next) {
        let token = req.query.token || req.headers.authorization

        if (req.headers.authorization) {
            token = token.split(' ').pop().trim()
        }

        if (!token) {
            return res.status(400).json({message: 'No token found'})
        }

        try {
            const { data } = jwt.verify(token, process.env.TOKEN_SECRET, {maxAge: expiration})
            req.user = data 
        } catch {
            console.log('Invalid token')
            return res.status(400).json({message: 'Invalid token'})
        }

        next()
    },
    signToken: function ({ username, email, _id, points}) {
        const payload = { username, email, _id, points}
        return jwt.sign({ data: payload}, process.env.TOKEN_SECRET, { expiresIn: expiration})
    }
}