const mongoose = require("mongoose");
const ApiError = require("../middlewares/ApiError");

const schema = new mongoose.Schema({
    district : {
        type : String,
        required : true,
        lowercase : true  
    },
    type : {
        type : String,
        required : true,
        lowercase : true
    },
    startDate : {
        type : Date,
        required : true
    },
    endDate : {
        type : Date,
        required : true
    }
});

schema.index({district : 1, type : 1}, {unique : true});

schema.pre('save', function(next){
    next();
})

const Campaign = mongoose.model('campaigns', schema);

module.exports = Campaign;