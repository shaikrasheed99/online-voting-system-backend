const httpStatus = require("http-status");
const ApiError = require("../middlewares/ApiError");
const { CastVote, Candidate } = require("../models");
const candidateService = require("./candidate.service.js");

const createVote = async(voteBody) => {
    const {voterId, candidateId} = voteBody;
    if(!voterId || !candidateId){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterID and CandidateID are required");
    }
    const candidate = await Candidate.findOne({candidateId, accepted : 1});
    if(!candidate){
        throw new ApiError(httpStatus.NOT_FOUND, "Candidate is not accepted");
    }
    if(await isVoted(voterId, candidate.type)){;
        throw new ApiError(httpStatus.BAD_REQUEST, `You have already voted for this ${candidate.type.toUpperCase()} type`);
    }
    const vote = await CastVote.create(voteBody);
    return vote;
};

const getVotesByVoterId = async(voterId) => {
    const votes = [];
    await (await CastVote.find({voterId})).forEach((vote) => {
        votes.push(vote);
    });
    if(votes.length === 0){
        throw new ApiError(httpStatus.NOT_FOUND, "Empty Votes");
    }
    return votes;
};

const isVoted = async(voterId, type) => {
    const isvoted = await CastVote.findOne({voterId, type});
    if(isvoted != null){
        return true;
    } else {
        return false;
    }
};

const queryVotes = async(req, res) => {
    const votes = [];
    await (await CastVote.find()).forEach((vote) => {
        votes.push(vote);
    });
    if(votes.length === 0){
        throw new ApiError(httpStatus.NOT_FOUND, "Empty Votes");
    }
    return votes;
};

const resultsByTypeAndArea = async(inputType, inputArea) => {
    const pipeline = [
        {$match : {type : inputType, area : inputArea}},
        {$group : {_id : "$candidateId", count : {$sum : 1}}},
        {$sort : {count : -1}}
    ];
    let candidates = await CastVote.aggregate(pipeline);
    const winners = [];
    winners.push(candidates[0]);
    let previous = candidates[0];
    if(candidates[1] !== undefined){
        candidates = [candidates[1]];
        candidates.every((candidate) => {
            if(candidate.count !== previous.count){
                return false;
            }
            winners.push(candidate);
            return true;
        });
    }
    return winners;
};

const cmResults = async(inputType) => {
    const pipeline = [
        {$match : {type : inputType}},
        {$group : { _id : "$partyName", count : {$sum : 1}}},
        {$sort : {count : -1}}
    ];
    let candidates = await CastVote.aggregate(pipeline);
    const responce = [];
    responce.push(candidates[0]);
    let previous = candidates[0];
    if(candidates[1] !== undefined){
        candidates = [candidates[1]];
        candidates.every((candidate) => {
            if(candidate.count !== previous.count){
                return false;
            }
            responce.push(candidate);
            return true;
        });
    }
    var winners = [];
    responce.every(async(element) => {
        const partyName = element._id;
        const candidate = await candidateService.getCmCandidate("cm", partyName);
        winners[winners.length] = candidate;
        return true;
    });
    console.log(winners);
    return winners;
};

module.exports = {
    createVote,
    getVotesByVoterId,
    isVoted,
    resultsByTypeAndArea,
    queryVotes,
    cmResults
};
