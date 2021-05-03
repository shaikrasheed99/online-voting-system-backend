const catchAsync = require("../middlewares/catchAsync");
const httpStatus = require("http-status");
const { voterService, tokenService } = require("../services");

const register = catchAsync(async(req, res) => {
    const voter = await voterService.createVoter(req.body);
    res.status(httpStatus.CREATED).send({voter});
});

const login = catchAsync(async(req, res) => {
    const voter = await voterService.verifyCredientials(req.body);
    //const token = await tokenService.createToken(voter.voterId, voter.role);
    res.status(httpStatus.OK).send({voter, token});
});

const refreshToken = catchAsync(async(req, res) => {
    const inputToken = req.headers.authorization.split(' ')[1];
    const token = await tokenService.verifyToken(inputToken);
    res.status(httpStatus.OK).send({token});
});

const queryVoters = catchAsync(async(req, res) => {
    const voters = await voterService.queryVoters();
    res.status(httpStatus.FOUND).send({voters});
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
    const response = {
        code : httpStatus.OK,
        message : "Deleted Voter",
        result : deletedVoter
    };
    res.status(httpStatus.OK).send(response);
});

module.exports = {
    register,
    login,
    refreshToken,
    queryVoters,
    getVoterByVoterId,
    updateVoterByVoterId,
    deleteVoterByVoterId
};