const httpStatus = require("http-status");
const mongoose = require("mongoose");
const ApiError = require("../middlewares/ApiError");
const Candidate = require("./candidate.model");
const Voter = require("./voter.model");

const schema = new mongoose.Schema({
    voterId : {
        type : String,
        required : true
    },
    candidateId : {
        type : String,
        required : true
    },
    type : {
        type : String,
        lowercase : true
    },
    area : {
        type : String,
        trim : true,
        lowercase : true
    },
    partyName : {
        type : String,
        trim : true,
        lowercase : true
    }
});

schema.index({voterId : 1, candidateId : 1}, {unique : true});

schema.pre('save', async function(next){
    const voterId = this.voterId;
    const voter = await Voter.findOne({voterId});
    const candidateId = this.candidateId;
    const candidate = await Candidate.findOne({candidateId});
    this.partyName = candidate.partyName;
    this.type = candidate.type;
    if(this.type === "mp"){
        if(voter.district !== candidate.voterInfo.district){
            throw new ApiError(httpStatus.BAD_REQUEST, "Voter area is not equal to Candidate area");
        }
        this.area = candidate.voterInfo.district;
    } else if(this.type === "mla"){
        if(voter.constituency !== candidate.voterInfo.constituency){
            throw new ApiError(httpStatus.BAD_REQUEST, "Voter area is not equal to Candidate area");
        }
        this.area = candidate.voterInfo.constituency;
    } else if(this.type === "zptc"){
        if(voter.mandal !== candidate.voterInfo.mandal){
            throw new ApiError(httpStatus.BAD_REQUEST, "Voter area is not equal to Candidate area");
        }
        this.area = candidate.voterInfo.mandal;
    } else if(this.type === "sarpanch"){
        if(voter.village !== candidate.voterInfo.village){
            throw new ApiError(httpStatus.BAD_REQUEST, "Voter area is not equal to Candidate area");
        }
        this.area = candidate.voterInfo.village;
    }
    next();
});

const CastVote = mongoose.model("castvotes", schema);

module.exports = CastVote;