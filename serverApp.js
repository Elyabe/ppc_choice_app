const express = require('express')
const path = require('path')
var engine = require('ejs-locals');


const PORT = process.env.PORT || 3000
const comparison = require('./routes/controller')
const index = require('./routes/controller')

/*const bdFireRoute = require('./routes/db_firestore')

require('dotenv').config()
*/

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .engine('ejs', engine)
  .set('view engine', 'ejs')
  // .get('/', (req, res) => res.render('pages/index'))
  // .get('/', (req, res) => res.render('pages/home_construcao', { title: 'Seus putos' } ) )
  .get('/', index )
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
