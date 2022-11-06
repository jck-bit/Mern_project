const express = require('express')
const router = express.Router()

const {
    getAllProducts,
    createProduct
} = require('../controllers/productController')

router.route('/')
   .get(getAllProducts)

router.route('/create')
   .post(createProduct)



module.exports = router