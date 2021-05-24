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
    const parsedData = JSON.parse(campaignBody);
    const exists = await Campaign.findOne({district, type});
    if(exists){
        throw new ApiError(httpStatus.BAD_REQUEST, "Campaign already running");
    }
    let start = parsedData.startDate;
    start.setHours(parsedData.startTime + 5);
    start.setMinutes(start.getMinutes() + 30);
    let end = parsedData.endDate;
    end.setHours(parsedData.endTime + 5 + 12);
    end.setMinutes(end.getMinutes() + 30);
    const input = {
        district : parsedData.district,
        type : parsedData.type,
        startDate : start,
        endDate : end
    };
    const campaign = await Campaign.create(input);
    return campaign;
};

module.exports = {
    createEc,
    verifyCredientials,
    queryEcs,
    getEcByEcId,
    startCampaign
};