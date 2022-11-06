const express = require('express')
const router = express.Router()
const {
    createNewUser,
    getAllUsers,
    updateUser,
    deleteUser
    } = require('../controllers/usersController')

const {protect} = require('../middleware/AuthMiddleware')

router.get('/get', getAllUsers)
router.post('/', createNewUser)
router.post('/update', updateUser)
router.post('/delete', deleteUser)

module.exports = router
