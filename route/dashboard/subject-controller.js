const express = require('express');
const router = express.Router();
const db = require('../../config/db-functions');
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs');

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const { ensureAuthenticated } = require('../../config/auth');
const passport = require('passport');


router.get( '/db/subject/update/:id', (req, res, next) => {

    const get_disciplina = "SELECT * FROM disciplina WHERE cod_disciplina = " + req.params.id + ";"; 
    db.getRecords( get_disciplina, (result) => {
              res.send( result.rows );
          })
  }
);

router.get('/db/subject/', ensureAuthenticated, (req, res) => { 
         var deptos = [], disciplinas = []; 
     // res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    const get_qtd_disciplinas = "SELECT Disc.*, Dept.acronimo as acronimo_depto FROM disciplina as Disc, departamento as Dept WHERE Dept.cod_departamento = Disc.cod_departamento;";
    const get_deptos = "SELECT * FROM departamento;";


        db.getRecords( get_qtd_disciplinas, (result) => {
          disciplinas = result.rows;
          db.getRecords( get_deptos, (result) => {
              deptos = result.rows;
              res.render( './page/db/subject', { title: "PPC Choice - Dashboard", disciplinas: disciplinas, deptos:  deptos, user: req.user });
          })
        })

});


module.exports = router;