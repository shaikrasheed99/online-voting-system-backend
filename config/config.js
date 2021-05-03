const dotenv = require("dotenv");
const path = require("path");

dotenv.config({path : path.join(__dirname, '../.env')});

module.exports = {
    env : process.env.NODE_ENV,
    port : process.env.PORT,
    mongoose : {
        url : process.env.MONGODB_URL,
        options : {
            useUnifiedTopology : true,
            useCreateIndex : true,
            useNewUrlParser : true
        }
    },
    jwt : {
        secret : process.env.JWT_SECRET,
        time : process.env.JWT_TIME
    }
};