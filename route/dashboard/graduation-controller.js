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


router.get( '/db/graduation/get/:idCurso', function( req, res ) {
    
    const get_grade = "SELECT D.nome, D.carga_horaria, CC.cod_comp_curricular, CC.periodo from disciplina as D, componente_curricular as CC \
        WHERE CC.cod_ppc = " + req.params.idCurso + " AND CC.cod_disciplina = D.cod_disciplina AND CC.cod_departamento = D.cod_departamento ORDER BY CC.cod_comp_curricular;"
    

    db.getRecords( get_grade, (result) => {
            res.send( result.rows );
        })
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