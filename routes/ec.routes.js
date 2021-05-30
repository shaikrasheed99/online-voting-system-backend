const router = require("express").Router();
const {ecController, voterController, candidateController, castVoteController} = require("../controllers");
const auth = require("../middlewares/auth");
const access = require("../middlewares/access");

router.post('/register', ecController.register)
router.post('/login', ecController.login);
router.post('/forgot-password', ecController.forgotPassword);
router.post('/send-otp', ecController.sendOTP);
router.post('/verify-otp', ecController.verifyOTP);
router.get('/verified/:ecId', ecController.verifyEc);
router.post('/refresh-token', auth(["admin"]), ecController.refreshToken);

router.get('/ecs', auth(["admin"]), ecController.queryEcs);
router.get('/ecs/:ecid', auth(["admin"]), ecController.getEcByEcId);

router.post('/voters', auth(["admin"]), voterController.register);
router.get('/voters', auth(["admin"]), voterController.queryVoters);
router.get('/voters/:voterid', auth(["admin"]), voterController.getVoterByVoterId);
router.patch('/voters', auth(["admin"]), access("backward"), voterController.updateVoterByVoterId);
router.delete('/voters', auth(["admin"]), access("backward"), voterController.deleteVoterByVoterId);

router.get('/candidate-exists/:type/:area/:partyName', auth(["admin"]), candidateController.candidateExistsByTypeAreaPartyName);
router.get('/candidates', auth(["admin"]), candidateController.queryCandidates);
router.post('/request-nomination', auth(["admin"]), candidateController.requestNomination);
router.get('/candidates/:data', auth(["admin"]), candidateController.getCandidateByIdOrType);
router.get('/candidates/:type/:area', auth(["admin"]), candidateController.getCandidatesByTypeAndArea);
router.patch('/candidates', auth(["admin"]), access("backward"), candidateController.updateCandidateByCandidateId);
router.delete('/candidates', auth(["admin"]), access("backward"), candidateController.deleteCandidateByCandidateId);

router.post('/accept-nomination', auth(["admin"]), candidateController.acceptNomination);
router.get('/requests', auth(["admin"]), candidateController.getNominationRequests);
router.post('/start-campaign', auth(["admin"]), ecController.startCampaign);
router.post('/stop-campaign', auth(["admin"]), ecController.stopCampaign);
router.get('/campaigns', auth(["admin"]), ecController.queryCampaigns);

router.get('/votes', auth(["admin"]), castVoteController.queryVotes);
router.get('/results/:district/:type/:area', auth(["admin"]), access("backward"), castVoteController.resultsByTypeAndArea);
router.get('/voted/:voterId/:type', auth(["admin"]), castVoteController.isVoted);

module.exports = router;
