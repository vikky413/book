const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const seatfSchema = new Schema({
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
const fourModel = mongoose.model("fourSeatModel", seatfSchema);
module.exports = fourModel