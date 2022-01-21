const mongoose = require('mongoose')

mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost/trip-redux-db',
    {
        // userNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true,
        // useFindAndModify: false,
    }
)

module.exports = mongoose.connection