const router = require("express").Router();
const {ecController} = require("../controllers");

router.post('/register', ecController.register)
router.post('/login', ecController.login);

router.get('/ecs', ecController.queryEcs);
router.get('/ecs/:ecId', ecController.getEcByEcId);

module.exports = router;