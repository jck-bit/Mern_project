const rateLimit = require('express-rate-limit')
const {logEvents} = require('./logger')

const loginLimiter = rateLimit({
    windowMs: 60* 1000, //minute
    max:5,
    message:
       {message: 'Too Many attempts, please try again after 60s seconds'},
    handler:(req,res, next, options) => {
        logEvents(`Too Many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, err.Log)
        res.status(options.statusCode).send(options.message)
    }
})

module.exports = loginLimiter