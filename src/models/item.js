const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const itemSchema = new Schema({
    pass_cat : {
        type :String,
        required:true
    },
    pid :{
        type: Number,
        required : true
    },
    name : {
        type:String,
        required:true,
    },
    file : {
        type:String,
        required:true,
    },
    
    price : {
        type: Number,
        required:true
    },

    details : {
        type: String,
        required:true
    },
   
    
});

// Compile model from schema
const itemModel = mongoose.model("productModel", itemSchema);
module.exports = itemModel