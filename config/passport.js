const { Strategy, ExtractJwt} = require("passport-jwt");
const config = require("./config");
const { Voter, EC} = require("../models");

const jwtOptions = {
    secretOrKey : config.jwt.secret,
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken()
};

const jwtVerify = async(payload, done) => {
    try {
        const id = payload.sub;
        if(id.startsWith('EC')){
            const ec = await EC.findOne({'ecId' : id});
            if(!ec){
                return done(null, false);
            }
            return done(null, ec);
        } else if(id.startsWith('V')) {
            const voter = await Voter.findOne({'voterId' : id});
            if(!voter){
                return done(null, false);
            }
            return done(null, voter);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
};

const jwtStrategy = new Strategy(jwtOptions, jwtVerify);

module.exports = jwtStrategy;