const  User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

const login = asyncHandler(async(req, res) =>{
    const {email, password} = req.body

    if(!email || !password) {
        return res.status(400).json({message: "All Fields are required"})
    }

    const user = await User.findOne({email}).exec()
    if(!user || !user.active){
        return res.status(401).json({message:"User does not Exist"})
    }

    if(user && (await bcrypt.compare(password, user.password))){
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        })
    }else{
        res.status(400)
        throw new Error('Invalid Credentials')
    }

    
    
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

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '30d',
    })
  }

module.exports ={
    login,
    refresh,
    logout
}
