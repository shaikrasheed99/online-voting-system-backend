const httpStatus = require("http-status");
const moment = require("moment");
const ApiError = require("../middlewares/ApiError");
const { EC, Campaign } = require("../models");

const createEc = async(ecBody) => {
    if(!ecBody.ecId){
        throw new ApiError(httpStatus.BAD_REQUEST, "EcID required");
    }
    if(await EC.isEcIdTaken(ecBody.ecId)){
        throw new ApiError(httpStatus.BAD_REQUEST, "EcID already taken");
    }
    const ec = await EC.create(ecBody);
    return ec;
};

const verifyCredientials = async(ecBody) => {
    if(!ecBody.ecId){
        throw new ApiError(httpStatus.BAD_REQUEST, "EcID required");
    }
    if(!ecBody.password){
        throw new ApiError(httpStatus.BAD_REQUEST, "Password required");
    }
    const { ecId, password } = ecBody;
    const ec = await getEcByEcId(ecId);
    if(!ec){
        throw new ApiError(httpStatus.UNAUTHORIZED, "EC not found");
    }
    if(!(await ec.isPasswordMatch(password))){
        throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect password");
    }
    return ec;
};

const forgotPassword = async(inputBody) => {
    const {ecId, secret} = inputBody;
    const ec = await getEcByEcId(ecId);
    if(!ec){
        throw new ApiError(httpStatus.NOT_FOUND, "EC not found");
    }
    if(!secret){
        const {mobile, code} = inputBody;
        if(!mobile || !code){
            throw new ApiError(httpStatus.BAD_REQUEST, "Mobile and OTP is required");
        }
        if(ec.mobile !== mobile){
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
    await ec.save();
    return ec;
};

const queryEcs = async() => {
    const ecs = [];
    await (await EC.find()).forEach((ec) => ecs.push(ec));
    return ecs;
};

const getEcByEcId = async(ecId) => {
    if(!ecId){
        throw new ApiError(httpStatus.BAD_REQUEST, "EcID required");
    }
    const ec = await EC.findOne({ecId});
    if(!ec){
        throw new ApiError(httpStatus.NOT_FOUND, "Ec not found");
    }
    return ec;
};

const startCampaign = async(campaignBody) => {
    if(!campaignBody.district || !campaignBody.type){
        throw new ApiError(httpStatus.BAD_REQUEST, "District and Type are required");
    }
    const {district, type} = campaignBody;
    const exists = await Campaign.findOne({district, type});
    if(exists){
        throw new ApiError(httpStatus.BAD_REQUEST, "Campaign already running");
    }
    const present = new Date();
    const start = new Date(campaignBody.startDate);
    const end = new Date(campaignBody.endDate);
    const input = {
        district : campaignBody.district,
        type : campaignBody.type,
        startDate : start,
        endDate : end
    };
    const campaign = await Campaign.create(input);
    return campaign;
};

const stopCampaign = async(campaignBody) => {
    const {district, type} = campaignBody;
    if(!district || !type){
        throw new ApiError(httpStatus.BAD_REQUEST, "District and Type are required");
    }
    const campaign = await Campaign.findOne({district, type});
    if(!campaign){
        throw new ApiError(httpStatus.NOT_FOUND, "Campaingn is not found");
    }
    await campaign.remove();
    return campaign;
};

const queryCampaigns = async() => {
    const campaigns = [];
    await (await Campaign.find()).forEach((campaign) => {
        campaigns.push(campaign);
    });
    if(campaigns.length === 0){
        throw new ApiError(httpStatus.NOT_FOUND, "Campaigns are empty");
    }
    return campaigns;
};

module.exports = {
    createEc,
    verifyCredientials,
    forgotPassword,
    queryEcs,
    getEcByEcId,
    startCampaign,
    stopCampaign,
    queryCampaigns
};