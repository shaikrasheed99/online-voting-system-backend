const router = require("express").Router();
const {voterController, candidateController} = require("../controllers");

router.post('/register', voterController.register);
router.post('/login', voterController.login);
router.post('/refresh-token', voterController.refreshToken);

router.get('/voters/:voterid', voterController.getVoterByVoterId);
router.patch('/voters', voterController.updateVoterByVoterId);
router.delete('/voters', voterController.deleteVoterByVoterId);

router.post('/request-nomination', candidateController.requestNomination);
router.get('/candidates/:data', candidateController.getCandidateByIdOrType);
router.get('/candidates/:type/:area', candidateController.getCandidatesByTypeAndArea);
router.patch('/candidates', candidateController.updateCandidateByCandidateId);
router.delete('/candidates', candidateController.deleteCandidateByCandidateId);

module.exports = router;