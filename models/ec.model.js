const httpStatus = require("http-status");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const ApiError = require("../middlewares/ApiError");

const schema = mongoose.Schema({
    ecId : {
        type : String,
        required : true,
        unique : true,
        validate(value){
            if(!value.match(/^EC[0-9]{5}$/)){
                throw new ApiError(httpStatus.NOT_ACCEPTABLE, "ECID must be like ECXXXXX");
            }
        }
    },
    password : {
        type : String,
        required : true,
        minlength : [8, "Password must contain atleat 8 characters"],
        validate(value){
            if(!value.match(/\d/) || !value.match(/[A-Z]/) || !value.match(/[a-z]/)){
                throw new ApiError(httpStatus.NOT_ACCEPTABLE,"Invalid password");
            }
        }
    },
    role : {
        type : String,
        default : "admin"
    }
});

schema.statics.isEcIdTaken = async function(ecId){
    const ec = await EC.findOne({ecId});
    return ec;
};

schema.methods.isPasswordMatch = async function(password){
    const matched = await bcrypt.compare(password, this.password);
    return matched;
};

schema.pre('save', async function(next){
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const EC = mongoose.model('ecs', schema);

module.exports = EC;