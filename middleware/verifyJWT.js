const jwt = require('jsonwebtoken')


const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization ||req.headers.Authorization

    if(!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({message: 'Unauthorized'})
    }

    const token = authHeader.split(' ')[1]
}

module.exports = verifyJWT