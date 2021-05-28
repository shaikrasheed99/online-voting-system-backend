const httpStatus = require("http-status");
const ApiError = require("../middlewares/ApiError");
const catchAsync = require("../middlewares/catchAsync");
const { ecService, tokenService } = require("../services");

const register = catchAsync(async(req, res) => {
    const ec = await ecService.createEc(req.body);
    res.status(httpStatus.OK).send({ec});
});

const login = catchAsync(async(req, res) => {
    const ec = await ecService.verifyCredientials(req.body);
    const token = await tokenService.createToken(ec.ecId, ec.role);
    res.status(httpStatus.OK).send({ec, token});
});

const forgotPassword = catchAsync(async(req, res) => {
    const ec = await ecService.forgotPassword(req.body);
    res.status(httpStatus.OK).send("Password has been changed");
});

const refreshToken = catchAsync(async(req, res) => {
    const inputToken = req.headers.authorization.split(' ')[1];
    const payload = await tokenService.verifyToken(inputToken);
    const ec = await ecService.getEcByEcId(payload.sub);
    if(!ec){
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }
    const token = await tokenService.createToken(ec.ecId, ec.role);
    res.status(httpStatus.OK).send({token});
});

const queryEcs = catchAsync(async(req, res) => {
    const ecs = await ecService.queryEcs();
    res.status(httpStatus.OK).send(ecs);
});

const getEcByEcId = catchAsync(async(req, res) => {
    const ec = await ecService.getEcByEcId(req.params.ecid);
    res.status(httpStatus.OK).send({ec});
});

const verifyEc = catchAsync(async(req, res) => {
    const inputToken = req.headers.authorization.split(' ')[1];
    const payload = await tokenService.verifyToken(inputToken);
    const ec = await ecService.getEcByEcId(req.params.ecId);
    if((payload.sub === ec.ecId) && (payload.role === ec.role)){
        res.status(httpStatus.OK).send("verified");
    } else {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Your token is invalid");
    }
});

const startCampaign = catchAsync(async(req, res) => {
    const campaign = await ecService.startCampaign(req.body);
    res.status(httpStatus.OK).send({campaign});
});

const stopCampaign = catchAsync(async(req, res) => {
    const campaign = await ecService.stopCampaign(req.body);
    res.status(httpStatus.OK).send({campaign});
});

const queryCampaigns = catchAsync(async(req, res) => {
    const campaigns = await ecService.queryCampaigns();
    res.status(httpStatus.OK).send(campaigns);
});

const sendOTP = catchAsync(async(req, res) => {
    const {ecId, mobile} = req.body;
    if(!ecId || !mobile){
        throw new ApiError(httpStatus.BAD_REQUEST, "EcId and Mobile number are required");
    }
    const ec = await ecService.getEcByEcId(ecId);
    if(ec.mobile !== mobile){
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
    queryEcs,
    getEcByEcId,
    verifyEc,
    startCampaign,
    stopCampaign,
    sendOTP,
    verifyOTP,
    queryCampaigns
};