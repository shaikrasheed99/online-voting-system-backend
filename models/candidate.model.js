const httpStatus = require("http-status");
const mongoose = require("mongoose");
const validator = require("validator");
const ApiError = require("../middlewares/ApiError");

const schema = mongoose.Schema({
    candidateId : {
        type : String,
        unique : true,
        validate(value){
            if(!(value.match(/^C[0-9]{5}$/))){
                throw new ApiError(httpStatus.NOT_ACCEPTABLE, "CandidateID must like VXXXXX");
            }
        }
    },
    voterId : {
        type : String,
        required : true,
        validate(value){
            if(!(value.match(/^C[0-9]{5}$/))){
                throw new ApiError(httpStatus.NOT_ACCEPTABLE, "VoterID must like VXXXXX");
            }
        }
    },
    type : {
        type : String,
        required : true,
        lowercase : true,
        trim : true
    },
    accepted : {
        type : Number,
        default : 0
    },
});

schema.statics.isVoterIdTaken = async function(voterId){
    const voter = Voter.findOne({voterId});
    return voter;
};

schema.pre('save', async function(next){
    const id = this.voterId;
    id[0] = "C";
    this.candidateId = id;
    next();
});

const Candidate = mongoose.model('candidates', schema);

module.exports = Candidate;