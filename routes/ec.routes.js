const router = require("express").Router();
const {ecController, voterController, candidateController, castVoteController} = require("../controllers");

router.post('/register', ecController.register)
router.post('/login', ecController.login);
router.post('/refresh-token', ecController.refreshToken);

router.get('/ecs', ecController.queryEcs);
router.get('/ecs/:ecid', ecController.getEcByEcId);

router.get('/voters', voterController.queryVoters);
router.get('/voters/:voterid', voterController.getVoterByVoterId);
router.patch('/voters', voterController.updateVoterByVoterId);
router.delete('/voters', voterController.deleteVoterByVoterId);

router.get('/candidate-exists/:type/:area/:partyName', candidateController.candidateExistsByTypeAreaPartyName);
router.get('/candidates', candidateController.queryCandidates);
router.post('/request-nomination', candidateController.requestNomination);
router.get('/candidates/:data', candidateController.getCandidateByIdOrType);
router.get('/candidates/:type/:area', candidateController.getCandidatesByTypeAndArea);
router.patch('/candidates', candidateController.updateCandidateByCandidateId);
router.delete('/candidates', candidateController.deleteCandidateByCandidateId);

router.post('/accept-nomination', candidateController.acceptNomination);
router.get('/requests', candidateController.getNominationRequests);

router.get('/votes', castVoteController.queryVotes);

module.exports = router;