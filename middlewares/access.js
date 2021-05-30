const httpStatus = require("http-status");
const { Campaign } = require("../models");
const ApiError = require("./ApiError");
const {voterService, candidateService} = require("../services");

const access = (input) => (req, res, next) => {
    return new Promise(async(resolve, reject) => {
        if(input !== null){
            if(input === "forward"){
                if((req.body.voterId !== undefined) && (req.body.candidateId !== undefined)){
                    const {voterId, candidateId} = req.body;
                    const voter = await voterService.getVoterByVoterId(voterId);
                    const candidate = await candidateService.getCandidateByCandidateId(candidateId);
                    const district = voter.district;
                    const type = candidate.type;
                    const campaign = await Campaign.findOne({district, type});
                    const presentTime = new Date();
                    if(campaign === null){
                        return reject(new ApiError(httpStatus.UNAUTHORIZED, "You cannot vote because Campaign is not running now"));
                    }
                    if((campaign !== null) && ((presentTime <= campaign.startDate) && (presentTime > campaign.endDate))){
                        return reject(new ApiError(httpStatus.UNAUTHORIZED, "You cannot vote because Campaign is not running now"));
                    }
                    return resolve();
                }
                return reject(new ApiError(httpStatus.BAD_REQUEST, "District and Type are required"));
            } else if(input === "backward"){
                if((req.params.district !== undefined) && (req.params.type !== undefined)){
                    const {district, type} = req.params;
                    const campaign = await Campaign.findOne({district, type});
                    const presentTime = new Date();
                    if((campaign) && ((presentTime >= campaign.startDate) && (presentTime < campaign.endDate))){
                        return reject(new ApiError(httpStatus.UNAUTHORIZED, `You cannot view results while Campaign is running`));
                    }
                    return resolve();
                }
                if(req.body.voterId !== undefined){
                    const {voterId} = req.body;
                    const voter = await voterService.getVoterByVoterId(voterId);
                    const district = voter.district;
                    const campaign = await Campaign.findOne({district});
                    const presentTime = new Date();
                    if((campaign) && ((presentTime >= campaign.startDate) && (presentTime < campaign.endDate))){
                        let message = "update";
                        if(req.method === "DELETE"){
                            message = "delete";
                        }
                        return reject(new ApiError(httpStatus.UNAUTHORIZED, `You cannot ${message} details while Campaign is running`));
                    }
                    return resolve();
                } else if(req.body.candidateId !== undefined){
                    const {candidateId} = req.body;
                    const candidate = await candidateService.getCandidateByCandidateId(candidateId);
                    const district = candidate.voterInfo.district;
                    const campaign = await Campaign.findOne({district});
                    if((campaign) && ((presentTime >= campaign.startDate) && (presentTime < campaign.endDate))){
                        let message = "update";
                        if(req.method === "DELETE"){
                            message = "delete";
                        }
                        return reject(new ApiError(httpStatus.UNAUTHORIZED, `You cannot ${message} details while Campaign is running`));
                    }
                    return resolve();
                }
                return reject(new ApiError(httpStatus.BAD_REQUEST, "District and Type are required"));
            }
        }
        return reject(new ApiError(httpStatus.FORBIDDEN, "You dont have right to access to this API"));
    }).then(() => next())
    .catch((error) => next(error));
};

module.exports = access;