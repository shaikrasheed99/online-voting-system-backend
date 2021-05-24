const httpStatus = require("http-status");
const ApiError = require("../middlewares/ApiError");
const catchAsync = require("../middlewares/catchAsync");
const { ecService, tokenService } = require("../services");

const register = catchAsync(async(req, res) => {
    const ec = await ecService.createEc(req.body);
    res.status(httpStatus.CREATED).send({ec});
});

const login = catchAsync(async(req, res) => {
    const ec = await ecService.verifyCredientials(req.body);
    const token = await tokenService.createToken(ec.ecId, ec.role);
    res.status(httpStatus.OK).send({ec, token});
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
    res.status(httpStatus.FOUND).send(ecs);
});

const getEcByEcId = catchAsync(async(req, res) => {
    const ec = await ecService.getEcByEcId(req.params.ecid);
    res.status(httpStatus.FOUND).send({ec});
});

const verify = catchAsync(async(req, res) => {
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
    const {district, type} = req.body;
});

module.exports = {
    register,
    login,
    refreshToken,
    queryEcs,
    getEcByEcId,
    verify,
    startCampaign
};