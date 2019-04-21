const express = require('express');
const router = express.Router();
const db = require('../config/db-functions');
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs');

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const { ensureAuthenticated } = require('../config/auth');
const passport = require('passport');


const ws_controller = require('./workspace/ws-controller')
const db_controller = require('./dashboard/db-controller')
const user_controller = require('./user/user-controller')

router.get('/ws/*', ws_controller )
router.get('/db/*', db_controller )
router.get('/user/*', user_controller )
router.post('/user/*', user_controller )



router.get( '/', function( req, res ) {
    res.redirect('/ws/home');
});

// router.get( '/getGrade/:idCurso', function( req, res ) {
    
//     const get_grade = "SELECT D.nome, D.carga_horaria, CC.cod_comp_curricular, CC.periodo from disciplina as D, componente_curricular as CC \
//         WHERE CC.cod_ppc = " + req.params.idCurso + " AND CC.cod_disciplina = D.cod_disciplina AND CC.cod_departamento = D.cod_departamento ORDER BY CC.cod_comp_curricular;"
    

//     db.getRecords( get_grade, (result) => {
//             res.send( result.rows );
//         })
// })

    
router.get( '/getDep/:idCurso', function( req, res ) {
  
  const get_dp = "SELECT * FROM dependencia WHERE cod_comp_curricular IN (\
                  SELECT cod_comp_curricular FROM componente_curricular WHERE cod_ppc = " + req.params.idCurso + " );"

  db.getRecords( get_dp, (result) => {
      res.send( result.rows );
   });
})
    

router.get( '/getReaprov/:idCurso', function( req, res ) {
    
    const get_reaprov = "SELECT * FROM reaproveitamento WHERE cod_ppc_destino = " + req.params.idCurso + ";"

        db.getRecords( get_reaprov, (result) => {
            console.log(result.rows)
            res.send( result.rows );
             });
        })



router.get('/compare/:idCursoAtual/:idCursoAlvo', function( req, res ){
   
    const get_ppc = "SELECT cod_ppc FROM curso WHERE cod_curso = " + req.params.idCursoAtual;

    const get_dp = "SELECT * FROM corresponde WHERE cod_comp_curricular IN (\
                    SELECT cod_comp_curricular FROM componente_curricular WHERE cod_ppc IN (" +  get_ppc + ") );"



    var returnVals, ret, data;

    db.getRecords( get_dp, (result) => {
        res.send( result.rows )
    })
});

module.exports = router;