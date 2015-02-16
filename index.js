var express = require('express');
var app = express();

var server = require('http').Server(app);
var passport = require('passport');
// This is the file we created in step 2.
// This will configure Passport to use Auth0
var strategy = require('./strategy.js');

// Session and cookies middlewares to keep user logged in
var cookieParser = require('cookie-parser');
var session = require('express-session');
var io               = require("socket.io")(server),
    passportSocketIo = require("passport.socketio");


var Auth0 = require('auth0');

var api = new Auth0({
	domain: process.env['AUTH0_DOMAIN'],
    clientID: process.env['AUTH0_CLIENT_ID'],
    clientSecret: process.env['AUTH0_CLIENT_SECRET']
});
var pg = require('pg')
  , pgSession = require('connect-pg-simple')(session);
 
store =  new pgSession({
    pg : pg,
    conString : process.env.DATABASE_URL,
    tableName : 'session'
  })


app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'ejs');  
app.use(cookieParser());
app.use(session({
	 store: store, 
	 key: 'brianstorming.sid',
	 secret: process.env['AUTH0_CLIENT_SECRET']}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));


server.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

// Auth0 callback handler
app.get('/callback',
  passport.authenticate('auth0'),
  function(req, res) {
		api.getAccessToken(function (err, token) {
		  if (err) {
		    console.log('Error fetching token: ' + err);
		    return;
		  }
		  console.log( token ) ; 
 			res.redirect("/test.html?token=" + token);
	
		});
   
  });

app.get('/test.html', function (req, res) {
  res.render('pages/test.ejs', {
    user: req.user, //use this to display user information
    env: process.env
  })
});




//With Socket.io >= 1.0
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'brianstorming.sid',       // the name of the cookie where express/connect stores its session_id
  secret:      process.env['AUTH0_CLIENT_SECRET'],    // the session_secret to parse the cookie
  store:       store,        // we NEED to use a sessionstore. no memorystore please
  success:     onAuthorizeSuccess,  // *optional* callback on success - read more below
  fail:        onAuthorizeFail,     // *optional* callback on fail/error - read more below
}));

function onAuthorizeSuccess(data, accept){
  accept();
}

function onAuthorizeFail(data, message, error, accept){
  console.log('failed connection to socket.io:', message);
  if(error)
    accept(new Error(message));
  // this error will be sent to the user as a special error-package
  // see: http://socket.io/docs/client-api/#socket > error-object
}

var server = require("./server/app.js").server(io) ;


	
util = { inspect : function ( obj ) {
	if( !obj ) return "undefined"
	if (typeof obj.inspect == "function" ) return obj.inspect() ; 
	if (typeof obj.toString == "function" ) return obj.toString() ; 
	return obj ; 
    }} 