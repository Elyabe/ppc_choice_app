const express = require('express');
const router = express.Router();
const db = require('../config/db_functions');
const bodyParser = require('body-parser')
 const bcrypt = require('bcryptjs');

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const { ensureAuthenticated } = require('../config/auth');
const passport = require('passport');

router.post( '/login', (req, res, next) => {
    passport.authenticate('local', {
    session: true,
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
  },
);


router.get('/logout', (req, res) => {
  req.logout();
  // req.session = null;
  // req.flash('success_msg', 'You are logged out');
  // req.user = null;
  req.session.destroy();
  res.redirect('/home')
});


router.get( '/', function( req, res ) {
    res.redirect('/home');
});

router.get( '/login', function( req, res ) {
    res.render( './page/db/login', { title: "Login" } );
});

router.get( '/home', function( req, res ) {
     
     // res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    const get_qtd_cursos = "SELECT COUNT(cod_curso) FROM curso;"

        db.getRecords( get_qtd_cursos, (result) => {
            res.render( './page/ws/home', { title: "Seus putos", qtd_cursos: result.rows[0].count, user: req.user });
        })
    

});



router.get( '/comparison', ensureAuthenticated, function( req, res ) {
    const get_cursos = "SELECT C.cod_curso, C.nome, C.cod_ppc, C.ch_total_curso, P.status FROM curso as C, projeto_pedagogico_curso as P WHERE C.cod_ppc = P.cod_ppc;"

    db.getRecords( get_cursos, (result) => {
        res.render('./page/ws/comparison', { title: 'Seus putos', cursos : result.rows, user: req.user } )
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
    

router.get( '/getReaprov/:idCurso', function( req, res ) {
    
    const get_reaprov = "SELECT * FROM reaproveitamento WHERE cod_ppc_destino = " + req.params.idCurso + ";"

        db.getRecords( get_reaprov, (result) => {
            res.send( result.rows );
             });
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
        res.render('./page/db/password_change', { title: 'Settings: Password'} )
});


router.post( '/update/password', ensureAuthenticated, (req, res, next) => {
    
    const user_form = { current_password : req.body.current_password,
                   new_password : req.body.new_password,
                   confirm_new_password: req.body.confirm_new_password }

    const get_users = "SELECT * FROM usuario WHERE email = '" + user.email + "';"
        
        db.getRecords( get_users, (result) => {
        if ( result.rows.length > 0 )
        {
              user = result.rows[0];
            bcrypt.compare(user_form.current_password, user.senha, (err, isMatch) => 
            {
              if (err) throw err;
              if (isMatch) 
              {
                bcrypt.genSalt(10, (err, salt) => 
                {
                    bcrypt.hash( user_form.new_password, salt, (err, hash) => 
                    {
                        if (err) throw err;
                            
                        const update = "UPDATE usuario SET senha = '" +  hash   + "' WHERE email = '" + user.email + "' ;"
                                
                        db.getRecords( update, (result) => 
                        {
                            console.log(result.rows)
                            res.send( "Senha alterada com sucesso!");
                        })   
                    });
                });
              } else
                    res.send("senha atual nao confere!")
            });
        } else 
            res.send("usuario nao existe mais!")
        });
    });

module.exports = router;