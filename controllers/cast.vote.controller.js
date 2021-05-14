const httpStatus = require("http-status");
const catchAsync = require("../middlewares/catchAsync");
const { castVoteService } = require("../services");

const castVote = catchAsync(async(req, res) => {
    const castedVote = await castVoteService.createVote(req.body);
    res.status(httpStatus.OK).send({castedVote});
});

const isVoted = catchAsync(async(req, res) => {
    const isvoted = await castVoteService.isVoted(req.params.voterId, req.params.type);
    if(isvoted){
        res.status(httpStatus.OK).send("Voter has already voted");
    } else {
        res.status(httpStatus.NOT_FOUND).send("Voter has not voted");
    }
});

module.exports = {
    castVote,
    isVoted
};