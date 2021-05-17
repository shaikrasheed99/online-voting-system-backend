const router = require("express").Router();
const {ecController, voterController, candidateController, castVoteController} = require("../controllers");
const auth = require("../middlewares/auth");

router.post('/register', ecController.register)
router.post('/login', ecController.login);
router.post('/refresh-token', ecController.refreshToken);

router.get('/ecs', auth(["admin"]), ecController.queryEcs);
router.get('/ecs/:ecid', auth(["admin"]), ecController.getEcByEcId);

router.post('/voters', auth(["admin"]), voterController.register);
router.get('/voters', auth(["admin"]), voterController.queryVoters);
router.get('/voters/:voterid', auth(["admin"]), voterController.getVoterByVoterId);
router.patch('/voters', auth(["admin"]), voterController.updateVoterByVoterId);
router.delete('/voters', auth(["admin"]), voterController.deleteVoterByVoterId);

router.get('/candidate-exists/:type/:area/:partyName', auth(["admin"]), candidateController.candidateExistsByTypeAreaPartyName);
router.get('/candidates', auth(["admin"]), candidateController.queryCandidates);
router.post('/request-nomination', auth(["admin"]), candidateController.requestNomination);
router.get('/candidates/:data', auth(["admin"]), candidateController.getCandidateByIdOrType);
router.get('/candidates/:type/:area', auth(["admin"]), candidateController.getCandidatesByTypeAndArea);
router.patch('/candidates', auth(["admin"]), candidateController.updateCandidateByCandidateId);
router.delete('/candidates', auth(["admin"]), candidateController.deleteCandidateByCandidateId);

router.post('/accept-nomination', auth(["admin"]), candidateController.acceptNomination);
router.get('/requests', auth(["admin"]), candidateController.getNominationRequests);

router.get('/votes', auth(["admin"]), castVoteController.queryVotes);
router.get('/results/:type/:area', auth(["admin"]), castVoteController.resultsByTypeAndArea);
router.get('/cm-results', auth(["admin"]), castVoteController.cmResults);
router.get('/voted/:voterId/:type', auth(["admin"]), castVoteController.isVoted);

module.exports = router;
