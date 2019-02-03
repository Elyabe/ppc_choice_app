const express = require('express')
const path = require('path')
var engine = require('ejs-locals');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

require('./config/passport')(passport);



const PORT = process.env.PORT || 3000
const comparison = require('./routes/controller')
const index = require('./routes/controller')

express()
.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }))
  .use(passport.initialize())
  .use(passport.session())
  .use(flash())
  .use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
  })
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .engine('ejs', engine)
  .set('view engine', 'ejs')
  .get('/', index )
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