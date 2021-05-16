const router = require("express").Router();
const {voterController, candidateController, castVoteController} = require("../controllers");
const auth = require("../middlewares/auth");

router.post('/register', voterController.register);
router.post('/login', voterController.login);
router.post('/refresh-token', voterController.refreshToken);

router.get('/voters/:voterId', auth(["voter"]), voterController.getVoterByVoterId);
router.patch('/voters', auth(["voter"]), voterController.updateVoterByVoterId);
router.delete('/voters', auth(["voter"]), voterController.deleteVoterByVoterId);

router.get('/candidate-exists/:type/:area/:partyName', auth(["voter"]), candidateController.candidateExistsByTypeAreaPartyName);
router.post('/request-nomination', auth(["voter"]), candidateController.requestNomination);
router.get('/candidates/:data', auth(["voter"]), candidateController.getCandidateByIdOrType);
router.get('/candidates/:type/:area', auth(["voter"]), candidateController.getCandidatesByTypeAndArea);
router.patch('/candidates', auth(["voter"]), candidateController.updateCandidateByCandidateId);
router.delete('/candidates', auth(["voter"]), candidateController.deleteCandidateByCandidateId);

router.get('/voted/:voterId/:type', auth(["voter"]), castVoteController.isVoted);
router.post('/cast-vote', auth(["voter"]), castVoteController.castVote);
router.get('/results/:type/:area', auth(["voter"]), castVoteController.resultsByTypeAndArea);
router.get('/cm-results', auth(["voter"]), castVoteController.cmResults);

module.exports = router;