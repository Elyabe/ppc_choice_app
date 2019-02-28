const express = require('express')
const path = require('path')
var engine = require('ejs-locals');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

require('./config/passport')(passport);

// require('dotenv').config();

const PORT = process.env.PORT || 3000
const comparison = require('./route/controller')
const index = require('./route/controller')

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
  if ( req.isAuthenticated() )
    res.locals.login  = true;
  else
    res.locals.login = false;
  next();
  })
  // .use( function(req, res, next){
  //   res.locals.login = req.isAuthenticated() ? true : false;
  //   next()
  // })
  .set('views', path.join(__dirname, 'view'))
  .engine('ejs', engine)
  .set('view engine', 'ejs')
  .get('/', index )
  .get('/login', index )
  .post('/login', index )
  .get('/logout', index )
  .get('/home', index )
  .get('/database', comparison )
  .get('/comparison', comparison )
  .get('/getGrade/:idCurso', comparison )
  .get('/compare/:idCursoAtual/:idCursoAlvo', comparison )
  .get('/settings/password', comparison )
  .post('/update/password', comparison )
  .use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
      })
  .listen(PORT, () => console.log(`Listening on ${ PORT } \n 
    dotenv: ${ process.env.TESTE}`))
