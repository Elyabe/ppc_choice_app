module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Você precisa estar logado para continuar.');
    res.set({
    	'method': 'GET'
    }).redirect('/user/login');
  }
};