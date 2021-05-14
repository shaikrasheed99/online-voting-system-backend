const httpStatus = require("http-status");
const ApiError = require("../middlewares/ApiError");
const { CastVote, Candidate } = require("../models");

const createVote = async(voteBody) => {
    const {voterId, candidateId} = voteBody;
    if(!voterId || !candidateId){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterID and CandidateID are required");
    }
    const candidate = await Candidate.findOne({candidateId, accepted : 1});
    if(!candidate){
        throw new ApiError(httpStatus.NOT_FOUND, "Candidate is not accepted");
    }
    const vote = await CastVote.create(voteBody);
    return vote;
};

const isVoted = async(voterId, type) => {
    const isvoted = await CastVote.findOne({voterId, type});
    if(isvoted != null){
        return true;
    } else {
        return false;
    }
};

module.exports = {
    createVote,
    isVoted
};