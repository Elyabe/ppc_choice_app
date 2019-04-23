const express = require('express');
const router = express.Router();
const db = require('../../config/db-functions');
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs');

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const { ensureAuthenticated } = require('../../config/auth');
const passport = require('passport');


router.post( '/user/login', (req, res, next) => {
    passport.authenticate('local', {
    session: true,
    successRedirect: '/ws/home',
    failureRedirect: '/user/login',
    failureFlash: true
  })(req, res, next);
  },
);

router.get('/user/logout', (req, res) => {
  req.logout();
  // req.session = null;
  req.flash('success_msg', 'You are logged out');
  // req.user = null;
  req.session.destroy();
  res.locals.login = false;
  res.redirect('/ws/home')
});

router.get( '/user/login', function( req, res ) {
    res.render( './page/db/login', { title: "Login" } );
});

router.get( '/user/view', function( req, res ) {
    if ( res.locals.login == true )
      res.render( './page/db/user-profile', { title: "Profile", user : req.user } );
    else
      res.redirect('/ws/home');
});

router.post( '/user/update', function( req, res ) {
    const update = "UPDATE usuario SET nickname = '" +  req.body.nickname   + "' WHERE email = '" + user.email + "' ;"
    db.getRecords( update, (result) => {
      req.flash('success_msg', 'Suas alterações foram salvas e entrarão em vigor no seu próximo login. :)');
      res.redirect( '/user/view' );
    })
});


router.get( '/user/settings/password', ensureAuthenticated, function( req, res ) {
        res.render('./page/db/password-change', { title: 'Settings - Password', user : req.user} )
});

router.post( '/user/query', ensureAuthenticated, function( req, res ) {
    db.getRecords( req.body.comment, (result) => {
      res.send(result.rows);
    })
});


router.post( '/user/update/password', ensureAuthenticated, (req, res, next) => {
    
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