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
    },
    otp : {
        service : process.env.OTP_SERVICE_SID,
        account : process.env.OTP_ACCOUNT_SID,
        authToken : process.env.OTP_AUTH_TOKEN
    },
    payment : {
        id : process.env.PAYMENT_ID,
        secret : process.env.PAYMENT_SECRET
    },
    blockchain : {
        account : process.env.BLOCKCHAIN_ACCOUNT,
        privateKey : process.env.BLOCKCHAIN_PRIVATE_KEY,
        contract : process.env.BLOCKCHAIN_CONTRACT,
        infuraUrl : process.env.BLOCKCHAIN_INFURA_URL,
        abi : process.env.BLOCKCHAIN_ABI
    }
};