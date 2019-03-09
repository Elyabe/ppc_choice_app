const express = require('express');
const router = express.Router();
const db = require('../../config/db_functions');
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs');

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const { ensureAuthenticated } = require('../../config/auth');
const passport = require('passport');


router.get( '/db/home', ensureAuthenticated, function( req, res ) {
     
     // res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    const get_qtd_cursos = "SELECT * FROM curso;"


        db.getRecords( get_qtd_cursos, (result) => {
            res.render( './page/db/home', { title: "PPC Choice - Dashboard", cursos: result.rows, user: req.user });
        })

});


module.exports = router;