const express = require('express');
const router = express.Router();
const db = require('../../config/db-functions');
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs');

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const { ensureAuthenticated } = require('../../config/auth');
const passport = require('passport');


router.get( '/ws/home', function( req, res ) {
     
    const get_qtd_cursos = "SELECT COUNT(cod_curso) FROM curso;"
    
    req.user = res.locals.login ? req.user : define_user();
    db.getRecords( get_qtd_cursos, (result) => {
        res.render( './page/ws/home', { title: "PPC Choice - Home", qtd_cursos: result.rows[0].count, user: req.user });
    })

});


router.get( '/ws/contact', function( req, res ) {
    
  req.user = res.locals.login ? req.user : define_user();
  res.render( './page/ws/contact', { title: "PPC Choice - Contato", user: req.user });

});


router.get( '/ws/comparison', ensureAuthenticated, function( req, res ) {
    
    const get_cursos = "SELECT C.cod_curso, C.nome, C.cod_ppc, C.ch_total_curso, P.status FROM curso as C, projeto_pedagogico_curso as P WHERE C.cod_ppc = P.cod_ppc;"

    db.getRecords( get_cursos, (result) => {
        res.render('./page/ws/comparison', { title: 'PPC Choice - Comparison', cursos : result.rows, user: req.user } )
    })

});

function define_user()
{
    var nome = ['Gazela', 'Falcão', 'Lebre', 'Coruja', 'Gado', 'Leke'], sobrenome = ['Saltitante', 'Alegre', 'do Norte', 'da UFES', 'do Réu'];
    var i = Math.floor(Math.random() * nome.length ), j = Math.floor(Math.random() * sobrenome.length );
    var nick = nome[i] + ' ' + sobrenome[j];

    user = { 'nickname': nick }
  return user;
}

module.exports = router;