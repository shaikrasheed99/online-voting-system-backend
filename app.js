const express = require("express");
const xss = require("xss-clean");
const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const httpStatus = require("http-status");
const passport = require("passport");
const jwtStrategy = require('./config/passport');
const morgan = require("./config/morgan");
const routes = require("./routes");
const { errorConverter, errorHandler } = require("./middlewares/error");
const ApiError = require("./middlewares/ApiError");

const app = express();

app.use(morgan.successHandler);
app.use(morgan.errorHandler);

//for static files
app.use(express.static('public'));

//parses incoming requests with JSON payloads
app.use(express.json());

//parses incoming requests with urlencoded payloads
app.use(express.urlencoded({extended : true}));

//secure app by adding extra headers
app.use(helmet());

//sanitize user input coming from POST body, GET queries, and url params
app.use(xss());

//sanitize payload to prevent from MongoDB operator injection
app.use(mongoSanitize());

//compressing into gzip to make requests fasts
app.use(compression());

//enable preflight requests
app.use(cors());
app.options('*', cors());

//JWT Token authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

//whole routes
app.use('/', routes);

//send 404 error if requested API in not present
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, "Not found anything"));
});

//Convert the error
app.use(errorConverter);

//Handle the error
app.use(errorHandler);

module.exports = app;