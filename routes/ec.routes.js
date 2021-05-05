const router = require("express").Router();
const {ecController, voterController} = require("../controllers");

router.post('/register', ecController.register)
router.post('/login', ecController.login);
router.post('/refreshToken', ecController.refreshToken);

router.get('/ecs', ecController.queryEcs);
router.get('/ecs/:ecId', ecController.getEcByEcId);

router.get('/voters', voterController.queryVoters);
router.get('/voters/:voterId', voterController.getVoterByVoterId);
router.patch('/voters', voterController.updateVoterByVoterId);
router.delete('/voters', voterController.deleteVoterByVoterId);

module.exports = router;