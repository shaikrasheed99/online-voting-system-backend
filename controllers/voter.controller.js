const catchAsync = require("../middlewares/catchAsync");
const httpStatus = require("http-status");
const { voterService, tokenService } = require("../services");
const ApiError = require("../middlewares/ApiError");
const config = require("../config/config");
const client = require("twilio")(config.otp.account, config.otp.authToken);

const register = catchAsync(async(req, res) => {
    const voter = await voterService.createVoter(req.body);
    res.status(httpStatus.OK).send({voter});
});

const login = catchAsync(async(req, res) => {
    const voter = await voterService.verifyCredientials(req.body);
    const token = await tokenService.createToken(voter.voterId, voter.role);
    res.status(httpStatus.OK).send({voter, token});
});

const forgotPassword = catchAsync(async(req, res) => {
    const voter = await voterService.forgotPassword(req.body);
    res.status(httpStatus.OK).send("Password has been changed");
});

const refreshToken = catchAsync(async(req, res) => {
    const inputToken = req.headers.authorization.split(' ')[1];
    const payload = await tokenService.verifyToken(inputToken);
    const voter = await voterService.getVoterByVoterId(payload.sub);
    if(!voter){
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }
    const token = await tokenService.createToken(voter.voterId, voter.role);
    res.status(httpStatus.OK).send({token});
});

const queryVoters = catchAsync(async(req, res) => {
    const voters = await voterService.queryVoters();
    res.status(httpStatus.OK).send({voters});
});

const getVoterByVoterId = catchAsync(async(req, res) => {
    const voter = await voterService.getVoterByVoterId(req.params.voterId);
    res.status(httpStatus.OK).send({voter});
});

const updateVoterByVoterId = catchAsync(async(req, res) => {
    const updatedVoter = await voterService.updateVoterByVoterId(req.body);
    res.status(httpStatus.OK).send({updatedVoter});
});

const deleteVoterByVoterId = catchAsync(async(req, res) => {
    const deletedVoter = await voterService.deleteVoterByVoterId(req.body);
    res.status(httpStatus.OK).send({deletedVoter});
});

const verifyVoter = catchAsync(async(req, res) => {
    const inputToken = req.headers.authorization.split(' ')[1];
    const payload = await tokenService.verifyToken(inputToken);
    const voter = await voterService.getVoterByVoterId(req.params.voterId);
    if((payload.sub === voter.voterId) && (payload.role === voter.role)){
        res.status(httpStatus.OK).send("verified");
    } else {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Your token is invalid");
    }
});

const sendOTP = catchAsync(async(req, res) => {
    const {voterId, mobile} = req.body;
    if(!voterId || !mobile){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterId and Mobile number are required");
    }
    const voter = await voterService.getVoterByVoterId(voterId);
    if(voter.mobile !== mobile){
        throw new ApiError(httpStatus.BAD_REQUEST, "Registered mobile and provided mobile numbers are not equal");
    }
    client.verify.services(config.otp.service).verifications.create({
        to : mobile,
        channel : 'sms'
    }).then((verification) => {
        res.status(httpStatus.OK).send({success : true, message : "OTP has sent"});
    }).catch((error) => {
        if(error.status === 429){
            res.status(httpStatus.BAD_GATEWAY).send({success : false, message : "You have reached maximum attempts"});
        }
        res.status(httpStatus.BAD_GATEWAY).send({success : false, message : "failed to send otp"});
    });
});

const verifyOTP = catchAsync(async(req, res) => {
    const {mobile, code} = req.body;
    if(!mobile || !code){
        throw new ApiError(httpStatus.BAD_REQUEST, "Mobile and OTP are required");
    }
    client.verify.services(config.otp.service).verificationChecks.create({
        to : mobile,
        code : code
    }).then((verification) => {
        if(verification.status === "pending"){
            res.status(httpStatus.NOT_ACCEPTABLE).send({success : false, message : "Enter your correct OTP again"});
        }
        if((verification.status === "approved") && (verification.valid === true)){
            res.status(httpStatus.OK).send({success : true, message : "verified"});
        }
    }).catch((error) => {
        if(error.status === 429){
            res.status(httpStatus.BAD_GATEWAY).send({success : false, message : "You have reached maximum attempts"});
        }
        res.status(httpStatus.BAD_GATEWAY).send({success : false, message : error});
    });
});

module.exports = {
    register,
    login,
    forgotPassword,
    refreshToken,
    queryVoters,
    getVoterByVoterId,
    updateVoterByVoterId,
    deleteVoterByVoterId,
    verifyVoter,
    sendOTP,
    verifyOTP
};
