const express = require('express');
const router = express.Router();
const db = require('./db_functions');
const bodyParser = require('body-parser')

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const { ensureAuthenticated } = require('../config/auth');
const passport = require('passport');

router.post( '/login', (req, res, next) => {
    passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next);
  },
);

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});


router.get( '/', function( req, res ) {
    res.render( './pages/login', { title: "Logue, seus putos" } );
});

router.get( '/home', ensureAuthenticated, function( req, res ) {
    
    const get_qtd_cursos = "SELECT COUNT(cod_curso) FROM curso;"

        db.getRecords( get_qtd_cursos, (result) => {
            res.render( './pages/home_construcao', { title: "Seus putos", qtd_cursos: result.rows[0].count });
        })
    

});



router.get( '/comparison', ensureAuthenticated, function( req, res ) {
    const get_cursos = "SELECT C.cod_curso, C.nome, C.cod_ppc, C.ch_total_curso, P.status FROM curso as C, projeto_pedagogico_curso as P WHERE C.cod_ppc = P.cod_ppc;"

    db.getRecords( get_cursos, (result) => {
        res.render('index', { title: 'Seus putos', cursos : result.rows } )
    })

});

router.get( '/getGrade/:idCurso', function( req, res ) {
    
    const get_dp = "SELECT * FROM dependencia WHERE cod_comp_curricular IN (\
                    SELECT cod_comp_curricular FROM componente_curricular WHERE cod_ppc = " + req.params.idCurso + " );"

    const get_grade = "SELECT D.nome, D.carga_horaria, CC.cod_comp_curricular, CC.periodo from disciplina as D, componente_curricular as CC \
        WHERE CC.cod_ppc = " + req.params.idCurso + " AND CC.cod_disciplina = D.cod_disciplina AND CC.cod_departamento = D.cod_departamento ORDER BY CC.cod_comp_curricular;"
    

   var returnVals, ret, data;

    db.getRecords( get_grade, (result) => {
        ret = result.rows

        db.getRecords( get_dp, (result) => {
            ret_dp = result.rows    
        
            data = { grade : ret, depend: ret_dp }
            res.send( data );
             });
        })
    })
    
router.get('/compare/:idCursoAtual/:idCursoAlvo', function( req, res ){
   
    const get_ppc = "SELECT cod_ppc FROM curso WHERE cod_curso = " + req.params.idCursoAtual;

    const get_dp = "SELECT * FROM corresponde WHERE cod_comp_curricular IN (\
                    SELECT cod_comp_curricular FROM componente_curricular WHERE cod_ppc IN (" +  get_ppc + ") );"



    var returnVals, ret, data;

    db.getRecords( get_dp, (result) => {
        res.send({ equiv: result.rows })
    })
});

router.get( '/settings/password', ensureAuthenticated, function( req, res ) {
        res.render('./pages/password_change', { title: 'Settings: Password'} )
});

module.exports = router;