const httpStatus = require("http-status");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const ApiError = require("../middlewares/ApiError");

const schema = mongoose.Schema({
    voterId : {
        type : String,
        required : true,
        unique : true,
        validate(value){
            if(!(value.match(/^V[0-9]{5}$/))){
                throw new ApiError(httpStatus.NOT_ACCEPTABLE, "VoterID must like VXXXXX");
            }
        }
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minlength : [8, "Password must be atleast 8 characters"],
        validate(value){
            if(!value.match(/[0-9]/) || !value.match(/[a-z]/) || !value.match(/[A-Z]/)){
                throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Password contains atleast one number, one uppercase letter, one lowercase letter");
            }
        }
    },
    confirmPassword : {
        type : String,
        required : true,
        trim : true,
        minlength : [8, "Password must be atleast 8 characters"],
        validate(value){
            if(!value.match(/[0-9]/) || !value.match(/[a-z]/) || !value.match(/[A-Z]/)){
                throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Password contains atleast one number, one uppercase letter, one lowercase letter");
            }
        }
    },
    email : {
        type : String,
        required : true,
        lowercase : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Invalid Email")
            }
        }
    },
    firstName : {
        type : String,
        required : true,
        trim : true,
        lowercase : true
    },
    lastName : {
        type : String,
        required : true,
        trim : true,
        lowercase : true
    },
    dob : {
        type : Date,
        required : true
    },
    gender : {
        type : String,
        required : true,
        enum : ['M', 'F', 'O']
    },
    mobile : {
        type : String,
        required : true,
        minlength : 9,
        maxlength : 13,
    },
    state : {
        type : String,
        required : true,
        trim : true,
        lowercase : true
    },
    district : {
        type : String,
        required : true,
        trim : true,
        lowercase : true
    },
    constituency : {
        type : String,
        required : true,
        trim : true,
        lowercase : true
    },
    mandal : {
        type : String,
        required : true,
        trim : true,
        lowercase : true
    },
    village : {
        type : String,
        required : true,
        trim : true,
        lowercase : true
    },
    role : {
        type : String,
        default : "voter"
    }
});

schema.statics.isVoterIdTaken = async function(voterId){
    const voter = Voter.findOne({voterId});
    return voter;
};

schema.methods.isPasswordMatch = async function(password){
    const matched = await bcrypt.compare(password, this.password);
    return matched;
};

schema.pre('save', async function(next){
    next();
});

const Voter = mongoose.model('voters', schema);

module.exports = Voter;