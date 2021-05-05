const router = require("express").Router();
const {voterController} = require("../controllers");

router.post('/register', voterController.register);
router.post('/login', voterController.login);
router.post('/refreshToken', voterController.refreshToken);

router.get('/voters/:voterId', voterController.getVoterByVoterId);
router.patch('/voters', voterController.updateVoterByVoterId);
router.delete('/voters', voterController.deleteVoterByVoterId);

module.exports = router;