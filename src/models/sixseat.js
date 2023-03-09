const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const seatsSchema = new Schema({
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
const sixModel = mongoose.model("sixSeatModel", seatsSchema);
module.exports = sixModel