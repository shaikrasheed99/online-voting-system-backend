const httpStatus = require("http-status");
const { Voter } = require("../models");
const ApiError = require("../middlewares/ApiError");

const createVoter = async(voterBody) => {
    if(!voterBody.voterId){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterID required");
    }
    if(await Voter.isVoterIdTaken(voterBody.voterId)){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterID is already taken");
    }
    const voter = await Voter.create(voterBody);
    return voter;
};

const verifyCredientials = async(voterBody) => {
    if(!voterBody.voterId){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterID is required");
    } else if(!voterBody.password){
        throw new ApiError(httpStatus.BAD_REQUEST, "Password is required");
    }
    const {voterId, password} = voterBody;
    const voter = await getVoterByVoterId(voterId);
    if(!voter){
        throw new ApiError(httpStatus.UNAUTHORIZED, "Voter not found");
    }
    if(!(await voter.isPasswordMatch(password))){
        throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect password")
    }
    return voter;
};

const getVoterByVoterId = async(voterId) => {
    if(!voterId){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterID required");
    }
    const voter = await Voter.findOne({voterId});
    if(!voter){
        throw new ApiError(httpStatus.BAD_REQUEST, "Voter not found");
    }
    return voter;
};

const queryVoters = async() => {
    const voters = [];
    await (await Voter.find()).forEach((voter) => voters.push(voter));
    return voters;
};

const updateVoterByVoterId = async(voterBody) => {
    if(!voterBody.voterId){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterID required");
    }
    const voterId = voterBody.voterId;
    const voter = await getVoterByVoterId(voterId);
    if(!voter){
        throw new ApiError(httpStatus.NOT_FOUND, "Voter not found");
    }
    Object.assign(voter, voterBody);
    await voter.save();
    return voter;
};

const deleteVoterByVoterId = async(voterBody) => {
    if(!voterBody.voterId){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterID required");
    }
    const voterId = voterBody.voterId;
    const voter = await getVoterByVoterId(voterId);
    if(!voter){
        throw new ApiError(httpStatus.NOT_FOUND, "Voter not found");
    }
    await voter.remove();
    return voter;
};

module.exports = {
    createVoter,
    verifyCredientials,
    getVoterByVoterId,
    queryVoters,
    updateVoterByVoterId,
    deleteVoterByVoterId
};