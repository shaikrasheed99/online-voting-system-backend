const httpStatus = require("http-status");
const mongoose = require("mongoose");
const ApiError = require("../middlewares/ApiError");
const Voter = require("./voter.model");

const schema = mongoose.Schema({
    candidateId : {
        type : String,
        validate(value){
            if(!(value.match(/^C[0-9]{5}$/))){
                throw new ApiError(httpStatus.NOT_ACCEPTABLE, "CandidateID must like VXXXXX");
            }
        }
    },
    voterId : {
        type : String,
        unique : true,
        required : true,
        validate(value){
            if(!(value.match(/^V[0-9]{5}$/))){
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
    partyName : {
        type : String,
        required : true,
        lowercase : true
    },
    accepted : {
        type : Number,
        enum : [0, 1],
        default : 0
    },
    voterInfo : {
        type : Object
    }
});

schema.statics.isVoterIdTaken = async function(voterId){
    const voter = Candidate.findOne({voterId});
    return voter;
};

schema.pre('save', async function(next){
    this.candidateId = this.voterId.replace("V", "C");
    const voterId = this.voterId;
    const optionsToAvoid = { _id : 0, voterId : 0, password : 0, confirmPassword : 0, __v : 0};
    const voter = await Voter.findOne({voterId}, optionsToAvoid);
    this.voterInfo = voter;
    if(this.accepted == 1){
        this.accepted = 1;
    } else {
        this.accepted = 0;
    }
    next();
});

const Candidate = mongoose.model('candidates', schema);

module.exports = Candidate;