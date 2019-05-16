var createError = require('http-errors');
var express = require('express');
var path = require('path');
// ignore because we are not gonna use the default ones 
//var cookieParser = require('cookie-parser');
var logger = require('morgan');

//Allow to create and manage server side cookies
var session = require("express-session")
//Libraries for user authentication
var okta = require("@okta/okta-sdk-nodejs");
var ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;

//Enable the routes for my pages
const dashboardRouter = require("./routes/dashboard");         
const publicRouter = require("./routes/public");
const usersRouter = require("./routes/users");

var app = express();

//Create oktaClient  and ExpressOIDC object
var oktaClient = new okta.Client({
  orgUrl: 'https://dev-287682.oktapreview.com',//added this
  token: '00kwh7otbxXmwxy7tK2VbnRwtcMqEcB3AdQgPc1byy'//added this
});
const oidc = new ExpressOIDC({
  issuer: "https://dev-287682.oktapreview.com/oauth2/default", //added this
  client_id: '0oajdcnpmsCZ0VNnH0h7',//added this
  client_secret: 'Ihuar8WgT_c8FlCgLCaMvnuJMq42lPw0CfpqCk25',//added this
  redirect_uri: 'http://localhost:3000/users/callback',
  scope: "openid profile",
  routes: {
    login: {
      path: "/users/login"
    },
    callback: {
      path: "/users/callback",
      defaultRedirect: "/dashboard"
    }
  }
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// ignore because we are not gonna use the default ones 
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Plug the express session library with the other middlewares
app.use(session({
  secret: 'IUGHoiuhOIUGTjhasd234q',
  resave: true,
  saveUninitialized: false
}));
//Enable the OpenID connect
app.use(oidc.router);
//Get data from the logged user
app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }

  oktaClient.getUser(req.userinfo.sub)
    .then(user => {
      req.user = user;
      res.locals.user = user;
      next();
    }).catch(err => {
      next(err);
    });
});


//Actual usage of the routes
app.use('/', publicRouter);
app.use('/dashboard', loginRequired, dashboardRouter);
app.use('/users', usersRouter);

//Route to display user info
app.get('/test', (req, res) => {
  res.json({ profile: req.user ? req.user.profile : null });
});
function loginRequired(req, res, next) {
  if (!req.user) {
    return res.status(401).render("unauthenticated");
  }

  next();
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
