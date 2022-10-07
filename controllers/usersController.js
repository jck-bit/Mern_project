const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Note = require('../models/Note')

//desc Get All users
//@route GET/users
//@access private

const getAllUsers = asyncHandler(async (req, res) =>{
    const users = await User.find().select('-password').lean()
    if(!users?.length){
        return res.status(400).json({message: 'No users Found'})
    }
   res.json(users)
}) 

//desc create user
//@route post/users
//@access private

const createNewUser = asyncHandler(async (req, res) =>{
    const { username, password, roles} = req.body

    //confirm_data
    if(!username || !password || !Array.isArray(roles) ||!roles.length) {
        return res.status(400).json({message :'All fields are required'})
    }

    //check for duplicates
    const duplicate = await User.findOne({username}).lean().exec()
    if (duplicate) {
        return res.status(409).json({message: 'Username Alraedy in use'})
    }
    //Hash password
    const hashedpwd = await bcrypt.hash(password, 10) //salt rounds
    const userObject = {username, "password": hashedpwd, roles}

    //create and store
    const user = await User.create(userObject)
    if (user) {
        res.status(201).json({message: `new user ${username} created`})
    }else{
        res.status(400).json({message:'Invalid user data received'})
    }
})

//desc update user
//@route PATCH/users
//@access private

const updateUser = asyncHandler(async (req, res) =>{
    const { id, username, roles, active, password} = req.body
    
    
    //confirm data
    if(!id || !username ||!Array.isArray(roles) || !roles.length || typeof active !=='boolean'){
    return res.status(400).json({message: 'All Fields are required'})
    }
    
    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({message: 'user Not found'})
    }

    //check duplicate
    const duplicate = await User.findOne({username}).lean().exec()

    //allow updates to the original user
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(400).json({message: 'Duplicate username'})
    }
    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        //hash [assword]
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()
    res.json({message: `${updatedUser.username} updated`})
})

//desc delete user
//@route DELETE/users
//@access private

const deleteUser = asyncHandler(async (req, res) =>{
    const { id } = req.body

    if(!id) {
        return res.status(400).json({message: 'User Id required'})
    }

    const note = await Note.findOne({user: id}).lean().exec()
    if (note){
        return res.status(400).json({message :'User has assigned notes'})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message: 'User not found'})
    }
    const result = await user.deleteOne()
    const reply = `username ${result.username} with id ${result.id} deleted`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}