const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const seatSchema = new Schema({
    tname : {
        type:String,
        required:true,
    },
    
     tid : {
        type:Number,
        required:true
    },

});

// Compile model from schema
const twoModel = mongoose.model("twoSeatModel", seatSchema);
module.exports = twoModel