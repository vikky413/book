const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const catSchema = new Schema({
    menuCategory : {
        type:String,
        required:true,
    },
    
    file : {
        type:String,
        required:true
    },

});

// Compile model from schema
const catMenu = mongoose.model("categoryModel", catSchema);
module.exports = catMenu