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
        throw new ApiError(httpStatus.BAD_REQUEST, "You have already registered");
    }
    const {voterId, candidateId, type, partyName} = candidateBody;
    const voter = await Voter.findOne({voterId});
    if((type === "cm") && (await candidateExistsByTypeAreaPartyName(type, voter.state, partyName))){
        throw new ApiError(httpStatus.BAD_REQUEST, "CM Candidate was already there with Partname and Type in your area");
    } else if((type === "mp") && (await candidateExistsByTypeAreaPartyName(type, voter.district, partyName))){
        throw new ApiError(httpStatus.BAD_REQUEST, "MP Candidate was already there with Partname and Type in your area");
    } else if((type === "mla") && (await candidateExistsByTypeAreaPartyName(type, voter.constituency, partyName))){
        throw new ApiError(httpStatus.BAD_REQUEST, "MLA Candidate was already there with Partname and Type in your area");
    } else if((type === "zptc") && (await candidateExistsByTypeAreaPartyName(type, voter.mandal, partyName))){
        throw new ApiError(httpStatus.BAD_REQUEST, "ZPTC Candidate was already there with Partname and Type in your area");
    } else if((type === "sarpanch") && (await candidateExistsByTypeAreaPartyName(type, voter.village, partyName))){
        throw new ApiError(httpStatus.BAD_REQUEST, "Sarpanch Candidate was already there with Partname and Type in your area");
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
    if(requests.length == 0){
        throw new ApiError(httpStatus.NOT_FOUND, "Empty requests");
    }
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

const getCmCandidate = async(type, partyName) => {
    const candidate = await Candidate.findOne({type, accepted : 1, partyName});
    if(!candidate){
        throw new ApiError(httpStatus.NOT_FOUND, "CM candidate not found");
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

const candidateExistsByTypeAreaPartyName = async(type, area, partyName) => {
    let existedCandidate;
    if(type === "cm"){
        await (await Candidate.find({type, partyName})).every((candidate) => {
            if(candidate.voterInfo.state === area){
                existedCandidate = candidate;
                return false;
            }
            return true;
        });
    } else if(type === "mp"){
        await (await Candidate.find({type, partyName})).every((candidate) => {
            if(candidate.voterInfo.district === area){
                existedCandidate = candidate;
                return false;
            }
            return true;
        });
    } else if(type === "mla") {
        await (await Candidate.find({type, partyName})).every((candidate) => {
            if(candidate.voterInfo.constituency === area){
                existedCandidate = candidate
                return false;
            }
            return true;
        });
    } else if(type === "zptc") {
        await (await Candidate.find({type, partyName})).forEach((candidate) => {
            if(candidate.voterInfo.mandal === area){
                existedCandidate = candidate;
                return false;
            }
            return true;
        });
    } else if(type === "sarpanch") {
        await (await Candidate.find({type, partyName})).forEach((candidate) => {
            if(candidate.voterInfo.village === area){
                existedCandidate = candidate;
                return false;
            }
            return true;
        });
    }
    if(existedCandidate){
        return true;
    } else {
        return false;
    }
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
    deleteCandidateByCandidateId,
    candidateExistsByTypeAreaPartyName,
    getCmCandidate
};
