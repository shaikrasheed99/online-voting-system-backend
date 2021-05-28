const httpStatus = require("http-status");
const bcrypt = require("bcrypt");
const { Voter, Candidate } = require("../models");
const ApiError = require("../middlewares/ApiError");
const candidateService = require('./candidate.service');
const config = require("../config/config");
const client = require("twilio")(config.otp.account, config.otp.authToken);

const createVoter = async(voterBody) => {
    if(!voterBody.voterId){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterID required");
    }
    if(await Voter.isVoterIdTaken(voterBody.voterId)){
        throw new ApiError(httpStatus.NOT_ACCEPTABLE, "VoterID is already taken");
    }
    if(voterBody.password !== voterBody.confirmPassword){
        throw new ApiError(httpStatus.BAD_REQUEST, "Password and Confirm Password is not matching");
    }
    voterBody.password = await bcrypt.hash(voterBody.password, 10);
    voterBody.confirmPassword = voterBody.password;
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
        throw new ApiError(httpStatus.NOT_FOUND, "Voter not found");
    }
    if(!(await voter.isPasswordMatch(password))){
        throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect password")
    }
    return voter;
};

const forgotPassword = async(inputBody) => {
    const {voterId, secret} = inputBody;
    const voter = await getVoterByVoterId(voterId);
    if(!voter){
        throw new ApiError(httpStatus.NOT_FOUND, "Voter not found");
    }
    if(!secret){
        const {mobile, code} = inputBody;
        if(!mobile || !code){
            throw new ApiError(httpStatus.BAD_REQUEST, "Mobile and OTP is required");
        }
        if(voter.mobile !== mobile){
            throw new ApiError(httpStatus.BAD_REQUEST, "Registered mobile and provided mobile numbers are not equal");
        }
        let verified = null;
        const verification = await client.verify.services(config.otp.service).verificationChecks.create({
            to : mobile,
            code : code
        })
        if((verification.status === "approved") && (verification.valid === true)){
            verified = true;
        } else {
            verified = false;
        }
        if(!verified){
            throw new ApiError(httpStatus.UNAUTHORIZED, "Your OTP is not valid");
        }
    }
    let {password, confirmPassword} = inputBody;
    if(password !== confirmPassword){
        throw new ApiError(httpStatus.BAD_REQUEST, "Password and Confirm Password are not equal");
    }
    password = await bcrypt.hash(password, 10);
    confirmPassword = password;
    Object.assign(voter, {password, confirmPassword});
    await voter.save();
    return voter;
};

const getVoterByVoterId = async(voterId) => {
    if(!voterId){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterID required");
    }
    const voter = await Voter.findOne({voterId});
    if(!voter){
        throw new ApiError(httpStatus.NOT_FOUND, "Voter is not found");
    }
    return voter;
};

const queryVoters = async() => {
    const voters = [];
    await (await Voter.find()).forEach((voter) => {
        voters.push(voter)
    });
    if(voters.length == 0){
        throw new ApiError(httpStatus.NOT_FOUND, "Voters are empty");
    }
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
    const voterInCandidates = await Candidate.findOne({voterId});
    if(voterInCandidates){
        await voterInCandidates.save();
    }
    return voter;
};

const deleteVoterByVoterId = async(voterBody) => {
    if(!voterBody.voterId){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterID required");
    }
    const voterId = voterBody.voterId;
    const voterInCandidates = await Candidate.findOne({voterId});
    if(voterInCandidates){
        await voterInCandidates.remove();
    }
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
    forgotPassword,
    getVoterByVoterId,
    queryVoters,
    updateVoterByVoterId,
    deleteVoterByVoterId
};