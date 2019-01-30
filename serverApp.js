const express = require('express')
const path = require('path')
var engine = require('ejs-locals');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');


const PORT = process.env.PORT || 3000
const comparison = require('./routes/controller')
const statistics = require('./routes/controller')
const bdFireRoute = require('./routes/db_firestore')

require('./config/passport')(passport);
require('dotenv').config()


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
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))
  .use(cookieParser())
  // .get('/', (req, res) => res.render('pages/index'))
  // .get('/', (req, res) => res.render('pages/home_construcao', { title: 'Seus putos' } ) )
  .get('/', statistics )
  .post('/login', statistics )
  .get('/logout', statistics )
  .get('/home', statistics )
  .get('/database', comparison )
  .get('/comparison', comparison )
  .get('/getGrade/:idCurso', comparison )
  .get('/compare/:idCursoAtual/:idCursoAlvo', comparison )
/*  .get('/bd/:curso/:periodo', (req, res) => {
    const query = "SELECT D.nome, D.carga_horaria, CC.cod_comp_curricular from disciplina as D, componente_curricular as CC \
        WHERE CC.cod_ppc = " + req.params.curso + " AND CC.periodo = " + req.params.periodo + " AND CC.cod_disciplina = D.cod_disciplina AND CC.cod_departamento = D.cod_departamento ORDER BY CC.cod_comp_curricular;"
    
    var dt = bdRoute.consultar( query, req.params.curso, req.params.periodo )   
    console.log( "REST" + dt )
    res.render('pages/home_construcao', { title: 'Seus putos', data : dt } )
  })
*/  //.get('/firebase', bdFireRoute )
  //.get('/consulta', bdFireRoute )
  .use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
      })
  .listen(PORT, () => console.log(`Listening on ${ PORT } \n 
    dotenv: ${ process.env.TESTE}`))
