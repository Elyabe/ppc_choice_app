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
router.post('/ws/*', ws_controller )
router.get('/db/*', db_controller )
router.post('/db/*', db_controller )
router.get('/user/*', user_controller )
router.post('/user/*', user_controller )



router.get( '/', function( req, res ) {
    res.redirect('/ws/home');
});

router.get('/compare/:idCursoAtual/:idCursoAlvo', function( req, res ){
   
    const get_ppc = "SELECT cod_ppc FROM curso WHERE cod_curso = " + req.params.idCursoAtual;

    const get_dp = "SELECT * FROM corresponde WHERE cod_comp_curricular IN (\
                    SELECT cod_comp_curricular FROM componente_curricular WHERE cod_ppc IN (" +  get_ppc + ") );"
                    
    db.getRecords( get_dp, (result) => {
        res.send( result.rows )
    })
});

module.exports = router;