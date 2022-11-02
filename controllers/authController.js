const  User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

const login = asyncHandler(async(req, res) =>{
    const {username, password} = req.body

    if(!username || !password) {
        return res.status(400).json({message: "All Fields are required"})
    }

    const foundUser = await User.findOne({username}).exec()
    if(!foundUser || !foundUser.active){
        return res.status(401).json({message:"Unauthorized"})
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if(!match) return res.status(401).json({message: "Unauthorized"})

    const accessToken = jwt.sign(
        {
            "UserInfo":{
                "username":foundUser.username,
                "roles":foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10min'}
    )
    const refreshToken = jwt.sign(
        {"username": foundUser.username},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '1d'}
    )
    //create a secure cookie with the refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly:true, //only accessible by a web server
        secure:true, //https
        sameSite: 'none', //cross-sitw cookie
        maxAge: 7* 24 * 60 * 1000 // cookie expiry
    })
    //send accessToken containing username and roles
    res.json({accessToken})
})

const refresh = (req, res) => {
    const cookies = req.cookies

    if(!cookies?.jwt) return res.status(401).json({message:"unaothorized"})

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,

        asyncHandler(async (err, decoded) =>{
            if(err) return res.status(403).json({ message: "Forbidden"})

            const foundUser = await User.findOne({ username: decoded.username})

            if(!foundUser) return res.status(401).json({message: 'Unauthorized'})

            const accessToken = jwt.sign(
                {
                    "username": foundUser.username,
                    "roles":foundUser.roles
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30min'}
            )

            res.json({accessToken})
        })
    )

}

const logout = (req, res) =>{
    const cookies = req.cookies
    if(!cookies?.jwt) return res.sendStatus(204) //no content
    res.clearCookie('jwt', {httpOnly: true, sameSite: 'None' , secure: true})
    res.json({ message: "cookies cleared"})
}

module.exports ={
    login,
    refresh,
    logout
}
