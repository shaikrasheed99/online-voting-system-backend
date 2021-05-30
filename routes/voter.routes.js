const router = require("express").Router();
const {voterController, candidateController, castVoteController} = require("../controllers");
const auth = require("../middlewares/auth");
const access = require("../middlewares/access");

router.post('/register', voterController.register);
router.post('/login', voterController.login);
router.post('/forgot-password', voterController.forgotPassword);
router.post('/send-otp', voterController.sendOTP);
router.post('/verify-otp', voterController.verifyOTP);
router.get('/verified/:voterId', voterController.verifyVoter); //to verify voter by his token
router.post('/refresh-token', auth(["voter"]), voterController.refreshToken);

router.get('/voters/:voterId', auth(["voter"]), voterController.getVoterByVoterId);
router.patch('/voters', auth(["voter"]), access("backward"), voterController.updateVoterByVoterId);
router.delete('/voters', auth(["voter"]), access("backward"), voterController.deleteVoterByVoterId);

router.get('/candidate-exists/:type/:area/:partyName', auth(["voter"]), candidateController.candidateExistsByTypeAreaPartyName);
router.post('/request-nomination', auth(["voter"]), candidateController.requestNomination);
router.get('/candidates/:data', auth(["voter"]), candidateController.getCandidateByIdOrType);
router.get('/candidates/:type/:area', auth(["voter"]), candidateController.getCandidatesByTypeAndArea);
router.patch('/candidates', auth(["voter"]), access("backward"), candidateController.updateCandidateByCandidateId);
router.delete('/candidates', auth(["voter"]), access("backward"), candidateController.deleteCandidateByCandidateId);

router.get('/voted/:voterId/:type', auth(["voter"]), castVoteController.isVoted);
router.get('/votes/:voterId', auth(["voter"]), castVoteController.getVotesByVoterId);
router.post('/cast-vote', auth(["voter"]), access("forward"), castVoteController.castVote);
router.get('/results/:district/:type/:area', auth(["voter"]), access("backward"), castVoteController.resultsByTypeAndArea);

router.post('/payment-order', auth(["voter"]), voterController.paymentOrder);
router.post('/payment-verify', auth(["voter"]), voterController.paymentVerify);

module.exports = router;
