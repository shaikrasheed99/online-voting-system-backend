const httpStatus = require("http-status");
const catchAsync = require("../middlewares/catchAsync");
const { castVoteService } = require("../services");

const castVote = catchAsync(async(req, res) => {
    const castedVote = await castVoteService.createVote(req.body);
    res.status(httpStatus.OK).send({castedVote});
});

const getVotesByVoterId = catchAsync(async(req, res) => {
    const votes = await castVoteService.getVotesByVoterId(req.params.voterId);
    res.status(httpStatus.OK).send({votes});
});

const isVoted = catchAsync(async(req, res) => {
    const isvoted = await castVoteService.isVoted(req.params.voterId, req.params.type);
    if(isvoted){
        res.status(httpStatus.OK).send("Voter has already voted");
    } else {
        res.status(httpStatus.NOT_FOUND).send("Voter has not voted");
    }
});

const resultsByTypeAndArea = catchAsync(async(req, res) => {
    const winner = await castVoteService.resultsByTypeAndArea(req.params.type, req.params.area);
    if(winner.length == 1){
        res.status(httpStatus.OK).send({"winners" : winner});
    } else {
        res.status(httpStatus.OK).send({"winners" : winner});
    }
});

const queryVotes = catchAsync(async(req, res) => {
    const votes = await castVoteService.queryVotes();
    res.status(httpStatus.OK).send({votes});
});

module.exports = {
    castVote,
    isVoted,
    resultsByTypeAndArea,
    queryVotes,
    getVotesByVoterId
};
