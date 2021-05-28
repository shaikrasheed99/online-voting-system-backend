const passport = require("passport");
const httpStatus = require("http-status");
const ApiError = require("./ApiError");

const auth = (roles) => (req, res, next) => {
    return new Promise((resolve, reject) => {
        const validate = (roles, user) => {
            if(!roles.includes(user.role)){
                return reject(new ApiError(httpStatus.FORBIDDEN, "You dont have right to access to this API"));
            }
            if(user.ecId !== undefined){
                return resolve();
            }
            if((req.method === "GET") && (req.params.voterId !== undefined) && (req.params.voterId !== user.voterId)){
                return reject(new ApiError(httpStatus.FORBIDDEN, "You cannot see other voter details"));
            } else if((req.method === "POST") || (req.method === "DELETE") || (req.method === "PATCH")){
                if((req.body.voterId !== undefined) && (req.body.voterId !== user.voterId)){
                    return reject(new ApiError(httpStatus.FORBIDDEN, "You cannot access other voter details"));
                } else if ((req.body.voterId !== undefined) && (req.body.candidateId !== undefined)) { //specially for cast-vote api
                    if(req.body.voterId !== user.voterId){
                        return reject(new ApiError(httpStatus.FORBIDDEN, "You cannot see other voter details to vote"));
                    } else {
                        return resolve();
                    }
                } else if((req.body.candidateId !== undefined)){
                    const candidateId = req.body.candidateId;
                    const voterId = candidateId.replace("C", "V");
                    if(voterId !== user.voterId){
                        return reject(new ApiError(httpStatus.FORBIDDEN, "You cannot access other candidate details"));
                    }
                }
            }
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