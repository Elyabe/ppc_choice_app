const express = require('express')
const path = require('path')
var engine = require('ejs-locals');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

require('./config/passport')(passport);

if (express().get('env') == 'development'){ require('dotenv').config(); }

const PORT = process.env.PORT || 3000
const controller = require('./route/controller')

var num;

express()
.use(express.static(path.join(__dirname, 'public')))
.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
  }))
  .use(passport.initialize())
  .use(passport.session())
  .use(flash())
  .use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.login = req.isAuthenticated() ? true : false;
  next();
  })
  .set('views', path.join(__dirname, 'view'))
  .engine('ejs', engine)
  .set('view engine', 'ejs')
  .get('/*', controller )
  .post('/*', controller )
  .use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('./page/error', {
            title: "Oops! Ocorreu um erro",
            message: err.message,
            error: {}
        });
      })
  .listen(PORT, () => console.log(`Listening on ${ PORT } \n 
    dotenv: ${ process.env.TESTE}`))
