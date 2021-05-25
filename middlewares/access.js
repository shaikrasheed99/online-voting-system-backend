const httpStatus = require("http-status");
const { Campaign } = require("../models");
const ApiError = require("./ApiError");

const access = (input) => (req, res, next) => {
    return new Promise((resolve, reject) => {
        if(input !== null){
            if(input === "forward"){
                if((req.body.district !== undefined) && (req.body.type !== undefined)){
                    const district = req.body.district;
                    const type = req.body.type;
                    const campaign = await Campaign.findOne({district, type});
                    const presentTime = new Date();
                    if((!campaign) && !((presentTime >= campaign.startDate) && (presentTime < campaign.endDate))){
                        return reject(new ApiError(httpStatus.UNAUTHORIZED, "You cannot vote because Campaign is not running now"));
                    }
                    return resolve();
                }
                return reject(new ApiError(httpStatus.BAD_REQUEST, "District and Type are required"));
            } else if(input === "backward"){
                if((req.body.district !== undefined) && (req.body.type !== undefined)){
                    const district = req.body.district;
                    const type = req.body.type;
                    const campaign = await Campaign.findOne({district, type});
                    const presentTime = new Date();
                    if((campaign) && ((presentTime >= campaign.startDate) && (presentTime < campaign.endDate))){
                        return reject(new ApiError(httpStatus.UNAUTHORIZED, `You cannot ${req.method} because Campaign is running`));
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