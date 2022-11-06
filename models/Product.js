const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    // user:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     required:true,
    //     ref:'User'
    // },
    title:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:false
    },
    quantity:{
        type:String,
        required:true
    }

})

module.exports = mongoose.model('Product', productSchema)