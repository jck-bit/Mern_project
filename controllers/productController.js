const asyncHandler = require('express-async-handler')
const Product = require('../models/Product')

const getAllProducts =  asyncHandler(async (req, res) =>{
    const products = await Product.find().lean()
     
    res.json(products)
})

const createProduct = asyncHandler(async(req, res) =>{
    const {title, price, category, quantity} = req.body

    if (!title || !price ||!category ||!quantity){
        return res.status(400).json({message:"all fields are required"})
    }

    const duplicate = await Product.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()
    
    if (duplicate){
        return res.status(400).json({message:"Product Alraedy Exists"})
    }

    const product = await Product.create({
        title,
        price,
        quantity,
        category
    })
    if(product){
        return res.status(201).json({
            _id:product.id,
            title:product.title,
            price:product.price,
            category:product.category,
            quantity:product.quantity
        })
    }
})

module.exports = {
    getAllProducts,
    createProduct
}
