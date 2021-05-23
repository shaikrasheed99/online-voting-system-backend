const catchAsync = require("../middlewares/catchAsync");
const httpStatus = require("http-status");
const { voterService, tokenService } = require("../services");
const ApiError = require("../middlewares/ApiError");

const register = catchAsync(async(req, res) => {
    const voter = await voterService.createVoter(req.body);
    res.status(httpStatus.CREATED).send({voter});
});

const login = catchAsync(async(req, res) => {
    const voter = await voterService.verifyCredientials(req.body);
    const token = await tokenService.createToken(voter.voterId, voter.role);
    res.status(httpStatus.OK).send({voter, token});
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
    res.status(httpStatus.FOUND).send({voter});
});

const updateVoterByVoterId = catchAsync(async(req, res) => {
    const updatedVoter = await voterService.updateVoterByVoterId(req.body);
    res.status(httpStatus.OK).send({updatedVoter});
});

const deleteVoterByVoterId = catchAsync(async(req, res) => {
    const deletedVoter = await voterService.deleteVoterByVoterId(req.body);
    res.status(httpStatus.OK).send({deletedVoter});
});

const verify = catchAsync(async(req, res) => {
    const inputToken = req.headers.authorization.split(' ')[1];
    const payload = await tokenService.verifyToken(inputToken);
    const voter = await voterService.getVoterByVoterId(req.params.voterId);
    if((payload.sub === voter.voterId) && (payload.role === voter.role)){
        res.status(httpStatus.OK).send("verified");
    } else {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Your token is invalid");
    }
});

module.exports = {
    register,
    login,
    refreshToken,
    queryVoters,
    getVoterByVoterId,
    updateVoterByVoterId,
    deleteVoterByVoterId,
    verify
};