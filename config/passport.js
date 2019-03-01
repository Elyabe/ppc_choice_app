const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('./db_functions');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email', passReqToCallback: true}, (req, email, password, done) => {
      
      const get_users = "SELECT * FROM usuario WHERE email = '" + email + "';"
        db.getRecords( get_users, (result) => {
            if ( result.rows.length > 0 )
            {
              user = result.rows[0];
              console.log(user)
              bcrypt.compare(password, user.senha, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {

                const rec_login = "UPDATE usuario SET ultimo_login = NOW() WHERE email = '"+ user.email +"';"
                  db.getRecords( rec_login, (result) => {
                      console.log("Gravado o login")
                  })

                  return done(null, user);
              } else {
                req.flash('error_msg', 'Senha incorreta.');
                return done(null, false, { error_msg: 'Password incorrect' });
              }
            });
          } else
            {
                req.flash('error_msg', 'O e-mail não está registrado.');
              return done(null, false, {error_msg: 'That email is not registered' });
            }
        })
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.email);
  });

  passport.deserializeUser(function(email, done) {
      var user = { 'email': email };
      done(null, user);
  });
};