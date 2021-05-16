const passport = require("passport");
const httpStatus = require("http-status");
const ApiError = require("./ApiError");

const auth = (roles, id) => (req, res, next) => {
    return new Promise((resolve, reject) => {
        const validate = (roles, user) => {
            console.log(roles);
            return resolve();
        };
        passport.authenticate('jwt', {session : false}, async(error, user, info) => {
            if(error || !user){
                return reject(new ApiError(httpStatus.UNAUTHORIZED, `Please Authenticate ${info}`));
            }
            if(roles !== null){
                validate(roles, user);
            }
            return reject(new ApiError(httpStatus.FORBIDDEN, "You dont have right to access to this API"));
        })(req, res, next);
    }).then(() => next())
    .catch((error) => next(error));
};

module.exports = auth;