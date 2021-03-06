
//Servers
var express = require('express')
,   app     = express()
,   server  = require('http').Server(app)
,   io      = require("socket.io")(server)
,   socketioJwt = require('socketio-jwt')
,   ioBrainServer = require("./ioBrainServer.js") 

//Authentication
,   Auth0 = require('auth0')
,   api = new Auth0({
		domain: process.env['AUTH0_DOMAIN'],
	    clientID: process.env['AUTH0_CLIENT_ID'],
	    clientSecret: process.env['AUTH0_CLIENT_SECRET']
	})
,   passport = require('passport')
,   strategy = require('./strategy.js')
,   requiresLogin = require('./requireLogin.js')
,   passportSocketIo = require("passport.socketio")
//Session
, 	cookieParser = require('cookie-parser')
, 	session = require('express-session')
,   pg = require('pg')
,   pgSession = require('connect-pg-simple')(session)
,	store =  new pgSession({
    	pg : pg,
    	conString : process.env.DATABASE_URL,
    	tableName : 'session'
  	})
//Utilities
,   md5 = require('MD5')
,   bodyParser = require('body-parser')
,   multer = require('multer')
,   jwt = require('jsonwebtoken')
,   jwt_secret = Buffer(process.env['AUTH0_CLIENT_SECRET'], 'base64') ;


process.on('uncaughtException', function (err) {
    console.log(err);
}); 

var forceSsl = function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
 };

//config web server
app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'ejs');  



    if (process.env.NODE_ENV === 'production') {
        app.use(forceSsl);
    }

    app.use(cookieParser());
	app.use(session({
		 store: store, 
		 key: 'brianstorming.sid',
		 secret: process.env['AUTH0_CLIENT_SECRET']}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.static(__dirname + '/public'));
	app.use(bodyParser.json()); // for parsing application/json
	app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
	app.use(multer()); // for parsing multipart/form-data
	app.use(function(req, res, next) {
	        res.header("Access-Control-Allow-Origin", "*");
	        res.header("Access-Control-Allow-Headers", "X-Requested-With");
	        res.header("Access-Control-Allow-Headers", "Content-Type");
	        res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
	        next();
	    });
   // other configurations etc for express go here...




//config auth0
config = {
		callbackURL : process.env.AUTH0_CALLBACK_URL
	, 	clientID : process.env.AUTH0_CLIENT_ID 
	, 	domain : process.env.AUTH0_DOMAIN 
}


var clientNamespace = io.of('/clients');


clientNamespace.use(socketioJwt.authorize({
  secret: jwt_secret,
  handshake: true
}));

ioBrainServer.start(clientNamespace) ; 


server.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

//Landing 
app.get("/", function (req, res) {
  res.render('pages/landing.ejs', {
     user: req.user //use this to display user information
  ,  config : config 
  })
});
app.get("/index.html", function (req, res) {
  res.render('pages/landing.ejs', {
	user: req.user
	  ,  config : config 
  })
});

// Auth0 callback handler
app.get('/callback',
  passport.authenticate('auth0'),
  function(req, res) {
		res.redirect("/home");	
  });

//Home Page
app.get("/home", function (req, res) {
  res.render('pages/index.ejs', {
       user: req.user
    ,  config : config
  })
});

//Home Page
app.get("/about", function (req, res) {
  res.render('pages/about.ejs', {
       user: req.user
    ,  config : config 
  })
});

//Home Page
app.get("/contact", function (req, res) {
console.log( req.user )
  res.render('pages/contact.ejs', {

    	user: req.user 
    ,   config : config 
  })
});

app.get("/brainstorming/",
	requiresLogin, 
	function (req, res) {
	if( req.query.id ) { 
		var profile = {
	        userId : md5(req.user.id)
	    ,   bsId   : req.query.id
		, 	authorisations : [""]
	  	};
	  	var token = jwt.sign(profile,  jwt_secret, { expiresInMinutes: 60*5 });
		res.render( 'pages/visualisation' , { user : req.user, id : req.query.id , token : token,  config : config  })
	} else {		
		viewBrainstormings( req, res, 'pages/brainstorming.ejs' ) ;
	} 	
});



app.get("/agents",
	requiresLogin, 
	function (req, res) {
		viewBrainstormings( req, res, 'pages/agents.ejs' ) ;
	}

	)

app.post('/brainsToken', 
	requiresLogin, 
	function (req, res) {
	    var profile = {
	        userId : "brain:"+md5(req.user.id)
	    ,   bsId   : req.query.id
		, 	authorisations : ["segmentation", "wordnet", "info"]
	  	};
    var token = jwt.sign(profile,  jwt_secret, { expiresInMinutes: 60*5 });
    res.json({token: token});
});


app.post('/create', 
	requiresLogin, 
	function (req, res) {
		console.log(req.body);

		if( typeof req.body.title === "string" && req.body.title.length > 0  ) {
			var duration = -1
			,   publicBs   = false ; 


			if( typeof req.body.publicBs === "boolean ") publicBs = req.body.publicBs 
			if( req.body.duration instanceof Array ) {
				duration = (req.body.duration[0] * 60) + (req.body.duration[1]*1)
				req.body.duration = duration ;
			}
			var brainstorming = new ioBrainServer.Brainstorming({
				title    : req.body.title 
			,	creator  : md5(req.user.id) 
			, 	public   : publicBs	
			, 	duration : duration 					
			})
			console.log( brainstorming)
			brainstorming.save() ;
			res.redirect("/brainstorming#created")
  	}
  	

})


//Utilities
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
function viewBrainstormings( req, res , redirect) { 
	ioBrainServer.Brainstorming.loadBrainstormingLists( 
		md5(req.user.id)
		, function() {
			console.log( "error happend ") ;
			res.render(redirect, 
				{
			    user: req.user, //use this to display user information
			    brainstormings: {}}
			)	
		 }
		, function( publicBs, createdBs, particBs ) { 	
			 res.render(redirect, {
			    user: req.user, //use this to display user information
			    brainstormings: {
			    	public : {
			    		title : "Public Brainstorming",
			    		description : "Here are the public brainstormings",
			    		data : publicBs
			    	},
			    	self : {
			    		title : "Created Brainstorming",
			    		description : "Here are the brainstormings you have created.",
			    		data : createdBs
			    	},
			    	participated : {
			    		title : "My sessions",
			    		description : "Here are the brainstormings sessions you have participated in",
			    		data : particBs
			    	}
			    }
			  })

			}
		)
}
