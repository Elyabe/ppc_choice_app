const LocalStrategy = require('passport-local').Strategy;
const db = require('../routes/db_functions');
const bcrypt = require('bcryptjs');

// Load User model
// const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      const get_users = "SELECT * FROM usuario WHERE email = '" + email + "';"

        db.getRecords( get_users, (result) => {
            if ( result.rows.length > 0 )
            {
              if ( password == result.rows[0].senha )
              { 
                // user = { "id": '1', "name": 'teste', "email": 'teste@ppc', "password": '123', "date": null }
                user = result.rows[0]
                return done(null, user);
              } else
                return done(null, false, { message: 'Password incorrect' });
            } else
            {
              return done(null, false, { message: 'That email is not registered' });
            }
        })
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.email);
  });

  passport.deserializeUser(function(user, done) {
    // User.findById(id, function(err, user) {
      // done(err, user);
      done(null, user);
    // });
  });
};