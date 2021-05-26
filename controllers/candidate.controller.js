const httpStatus = require("http-status");
const catchAsync = require("../middlewares/catchAsync");
const { candidateService, voterService } = require("../services");

const requestNomination = catchAsync(async(req, res) => {
    const candidate = await candidateService.createCandidate(req.body);
    res.status(httpStatus.OK).send({candidate});
});

const acceptNomination = catchAsync(async(req, res) => {
    const acceptedCandidate = await candidateService.acceptCandidate(req.body);
    res.status(httpStatus.OK).send({acceptedCandidate});
});

const getNominationRequests = catchAsync(async(req, res) => {
    const requests = await candidateService.getNominationRequests();
    res.status(httpStatus.OK).send({requests});
});

const queryCandidates = catchAsync(async(req, res) => {
    const candidates = await candidateService.queryCandidates();
    res.status(httpStatus.OK).send({candidates});
});

const getCandidateByIdOrType = catchAsync(async(req, res) => {
    const candidate = await candidateService.getCandidateByIdOrType(req.params.data);
    res.status(httpStatus.OK).send({candidate});
});

const getCandidatesByTypeAndArea = catchAsync(async(req, res) => {
    const candidates = await candidateService.getCandidatesByTypeAndArea(req.params.type, req.params.area);
    res.status(httpStatus.OK).send({candidates});
});

const updateCandidateByCandidateId = catchAsync(async(req, res) => {
    const updatedCandidate = await candidateService.updateCandidateByCandidateId(req.body);
    res.status(httpStatus.OK).send({updatedCandidate});
});

const deleteCandidateByCandidateId = catchAsync(async(req, res) => {
    const deletedCandidate = await candidateService.deleteCandidateByCandidateId(req.body);
    res.status(httpStatus.OK).send({deletedCandidate});
});

const candidateExistsByTypeAreaPartyName = catchAsync(async(req, res) => {
    const {type, area, partyName} = req.params;
    const candidate = await candidateService.candidateExistsByTypeAreaPartyName(type, area, partyName);
    if(candidate){
        res.status(httpStatus.OK).send("Candidate already with that partname and type in that area");
    } else {
        res.status(httpStatus.NOT_FOUND).send("Candidate not exists");
    }
});

module.exports = {
    requestNomination,
    acceptNomination,
    getNominationRequests,
    queryCandidates,
    getCandidateByIdOrType,
    getCandidatesByTypeAndArea,
    updateCandidateByCandidateId,
    deleteCandidateByCandidateId,
    candidateExistsByTypeAreaPartyName
};