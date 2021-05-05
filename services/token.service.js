const jwt = require("jsonwebtoken");
const moment = require("moment");
const config = require("../config/config");

const createToken = async(id, role) => {
    const payload = {
        sub : id, role,
        iat : moment().unix(),
        exp : moment().add(config.jwt.time, 'minutes').unix()
    };
    const token = await jwt.sign(payload, config.jwt.secret);
    return token;
};

const verifyToken = async(token) => {
    const payload = await jwt.verify(token, config.jwt.secret);
    return payload;
};

module.exports = {
    createToken,
    verifyToken
};