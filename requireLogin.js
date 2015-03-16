module.exports = function(req, res, next) {
  if (!req.isAuthenticated()) {
  	console.log( "error ")
    return res.redirect('/');
  }
  next();
}