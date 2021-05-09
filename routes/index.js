const router = require("express").Router();
const voterRoutes = require("./voter.routes");
const ecRoutes = require("./ec.routes");

router.use('/', voterRoutes);
router.use('/ec', ecRoutes);

module.exports = router;