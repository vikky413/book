const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const summarySchema = new Schema({
   username : {
        type:String,
        required:true,
    },
    

});

// Compile model from schema
const Summary = mongoose.model("summaryModel", summarySchema);
module.exports = Summary