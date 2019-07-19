const express = require('express');
const router = express.Router();
const db = require('../../config/db-functions');
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs');

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const { ensureAuthenticated } = require('../../config/auth');
const passport = require('passport');

router.post( '/db/graduation/', (req, res, next) => {
	//res.send("graduation");
});

router.get('/db/graduation/', ensureAuthenticated, (req, res) => { 
	res.send("graduation");
});


router.get( '/db/graduation/grid/:idCurso', function( req, res ) {
    
    const get_grade = "SELECT D.nome, D.carga_horaria, CC.cod_comp_curricular, CC.periodo from disciplina as D, componente_curricular as CC \
        WHERE CC.cod_ppc = " + req.params.idCurso + " AND CC.cod_disciplina = D.cod_disciplina AND CC.cod_departamento = D.cod_departamento ORDER BY CC.cod_comp_curricular;"
    

    db.getRecords( get_grade, (result) => {
            res.send( result.rows );
        })
})

router.get( '/db/graduation/dependency/:idCurso', function( req, res ) {
  
  const get_dp = "SELECT * FROM dependencia WHERE cod_comp_curricular IN (\
                  SELECT cod_comp_curricular FROM componente_curricular WHERE cod_ppc = " + req.params.idCurso + " );"

  db.getRecords( get_dp, (result) => {
      res.send( result.rows );
   });
})

router.get( '/db/graduation/transition/:idCurso', function( req, res ) {

    const get_grad_transition = "SELECT * FROM curso WHERE cod_ppc IN (\
                    SELECT cod_ppc_alvo FROM transicao_ppc WHERE cod_ppc_corrente = " + req.params.idCurso + ") ;";


    db.getRecords( get_grad_transition, (result) => {
            res.send( result.rows );
        })
})
    

router.get( '/db/graduation/reuse/:idCurso', function( req, res ) {
    
    const get_reaprov = "SELECT * FROM reaproveitamento WHERE cod_ppc_destino = " + req.params.idCurso + ";"

        db.getRecords( get_reaprov, (result) => {
            console.log(result.rows)
            res.send( result.rows );
             });
        })

router.get('/db/graduation/new/', ensureAuthenticated, (req, res) => { 
	res.send("graduation new");
});

router.get('/db/graduation/update/', ensureAuthenticated, (req, res) => { 
	res.send("graduation update");
});

router.get('/db/graduation/delete/', ensureAuthenticated, (req, res) => { 
	res.send("graduation delete");
});

router.get('/db/graduation/view/', ensureAuthenticated, (req, res) => { 
	res.send("graduation view");
});







module.exports = router;