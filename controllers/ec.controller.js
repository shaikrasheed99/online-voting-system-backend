const httpStatus = require("http-status");
const catchAsync = require("../middlewares/catchAsync");
const { ecService } = require("../services");

const register = catchAsync(async(req, res) => {
    const ec = await ecService.createEc(req.body);
    res.status(httpStatus.CREATED).send({ec});
});

const login = catchAsync(async(req, res) => {
    const ec = await ecService.verifyCredientials(req.body);
    res.status(httpStatus.UNAUTHORIZED).send({ec});
});

const queryEcs = catchAsync(async(req, res) => {
    const ecs = await ecService.queryEcs();
    res.status(httpStatus.FOUND).send(ecs);
});

const getEcByEcId = catchAsync(async(req, res) => {
    const ec = await ecService.getEcByEcId(req.params.ecId);
    res.status(httpStatus.FOUND).send({ec});
});

module.exports = {
    register,
    login,
    queryEcs,
    getEcByEcId
};