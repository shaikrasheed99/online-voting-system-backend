const httpStatus = require("http-status");
const ApiError = require("../middlewares/ApiError");
const { Candidate, Voter } = require("../models");

const createCandidate = async(candidateBody) => {
    if(!candidateBody.voterId){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterID is required");
    }
    if(!(await Voter.isVoterIdTaken(candidateBody.voterId))){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterID is not registered");
    }
    if(await Candidate.isVoterIdTaken(candidateBody.voterId)){
        throw new ApiError(httpStatus.BAD_REQUEST, "Candidate is already registered");
    }
    const candidate = await Candidate.create(candidateBody);
    return candidate;
};

const acceptCandidate = async(candidateBody) => {
    if(!candidateBody.candidateId){
        throw new ApiError(httpStatus.NOT_ACCEPTABLE, "CandidateID is required");
    }
    const candidateId = candidateBody.candidateId;
    const candidate = await getCandidateByCandidateId(candidateId);
    if(!candidate){
        throw new ApiError(httpStatus.NOT_FOUND, "Candidate not found");
    }
    Object.assign(candidate, {"accepted" : 1});
    await candidate.save();
    return candidate;
};

const getNominationRequests = async() => {
    const requests = await Candidate.find({accepted : 0});
    return requests;
};

const queryCandidates = async() => {
    const candidates = [];
    await (await Candidate.find({accepted : 1})).forEach((candidate) => {
        candidates.push(candidate);
    });
    if(candidates.length == 0){
        throw new ApiError(httpStatus.NOT_FOUND, "Candidates are empty");
    }
    return candidates;
};

const getCandidatesByType = async(type) => {
    if(!type){
        throw new ApiError(httpStatus.BAD_REQUEST, "Type is required");
    }
    const candidates = [];
    await (await Candidate.find({type, accepted : 1})).forEach((candidate) => {
        candidates.push(candidate);
    });
    if(candidates.length == 0){
        throw new ApiError(httpStatus.NOT_FOUND, "Candidates are not found");
    }
    return candidates;
};

const getCandidateByCandidateId = async(candidateId) => {
    if(!candidateId){
        throw new ApiError(httpStatus.BAD_REQUEST, "CandidateID is required");
    }
    const candidate = await Candidate.findOne({candidateId});
    if(!candidate){
        throw new ApiError(httpStatus.NOT_FOUND, "Candidate is not found");
    }
    return candidate;
};

const getCandidateByVoterId = async(voterId) => {
    if(!voterId){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterID is required");
    }
    const candidate = await Candidate.findOne({voterId});
    if(!candidate){
        throw new ApiError(httpStatus.NOT_FOUND, "Candidate is not found");
    }
    return candidate;
};

const getCandidateByIdOrType = async(data) => {
    let candidate;
    if(data.match(/^C[0-9]{5}$/)){
        candidate = await getCandidateByCandidateId(data);
    } else {
        candidate = await getCandidatesByType(data);
    }
    return candidate;
};

const getCandidatesByTypeAndArea = async(type, area) => {
    if(!type){
        throw new ApiError(httpStatus.BAD_REQUEST, "Type of seat is required");
    }
    if(!area){
        throw new ApiError(httpStatus.BAD_REQUEST, "Area is required");
    }
    let candidates = [];
    if(type === 'mp'){
        await (await Candidate.find({type, accepted : 1})).forEach((candidate) => {
            if(candidate.voterInfo.district === area){
                candidates.push(candidate);
            }
        });
    } else if(type === 'mla'){
        await (await Candidate.find({type, accepted : 1})).forEach((candidate) => {
            if(candidate.voterInfo.constituency === area){
                candidates.push(candidate);
            }
        });
    } else if(type === 'zptc'){
        await (await Candidate.find({type, accepted : 1})).forEach((candidate) => {
            if(candidate.voterInfo.mandal === area){
                candidates.push(candidate);
            }
        });
    } else if(type === 'sarpanch'){
        await (await Candidate.find({type, accepted : 1})).forEach((candidate) => {
            if(candidate.voterInfo.village === area){
                candidates.push(candidate);
            }
        });
    }
    if(candidates.length == 0){
        throw new ApiError(httpStatus.NOT_FOUND, "Candidates are not found");
    }
    return candidates;
};

const updateCandidateByCandidateId = async(candidateBody) => {
    if(!candidateBody.candidateId){
        throw new ApiError(httpStatus.BAD_REQUEST, "CandidateID is required");
    }
    const candidate = await getCandidateByCandidateId(candidateBody.candidateId);
    if(!candidate){
        throw new ApiError(httpStatus.NOT_FOUND, "Candidate not found");
    }
    Object.assign(candidate, candidateBody);
    await candidate.save();
    return candidate;
};

const deleteCandidateByCandidateId = async(candidateBody) => {
    if(!candidateBody.candidateId){
        throw new ApiError(httpStatus.BAD_REQUEST, "CandidateID is required");
    }
    const candidate = await getCandidateByCandidateId(candidateBody.candidateId);
    if(!candidate){
        throw new ApiError(httpStatus.NOT_FOUND, "Candidate is not found");
    }
    await candidate.remove();
    return candidate;
};

module.exports = {
    createCandidate,
    acceptCandidate,
    getNominationRequests,
    queryCandidates,
    getCandidateByIdOrType,
    getCandidateByCandidateId,
    getCandidateByVoterId,
    getCandidatesByType,
    getCandidatesByTypeAndArea,
    updateCandidateByCandidateId,
    deleteCandidateByCandidateId
};
