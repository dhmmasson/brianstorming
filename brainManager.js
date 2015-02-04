var version="0.1"

var nodeStatic = require('node-static')
, coffer = require('coffee-script')
, cp  = require('child_process')
, fs = require('fs')
, webrepl = require('node-web-repl')
, opt = require('node-getopt').create([
      ['h', 'help'    , 'display this help and exit']
    , ['V', 'version' , 'show version and exit']
    , ['v', 'verbose' , 'print debug information']
    , ['' , 'no_web'  , 'disable the built in web server. Useful if an existing webserver can be used to serve html files']
    , ['p', 'port=PORT_NUMBER'    , 'Listening port for the manager, default to 8088']
    , ['m', 'web_port=PORT_NUMBER'    , 'Listening port for the web interface, default to 8080']
    , ['s', 'serveur_port=PORT_NUMBER'    , 'Listening port for the brainstorming serveur, default to 8888']
    , ['C', 'configuration_file=FILE', 'Configuration file for the manager, the brains, and the user interfaces. Default : ./configuration.json']
])              // create Getopt instance
.bindHelp()     // bind option 'help' to default action
.on("version", function() { //Bind version to expected behavior
    console.log( "NodeManager_"+version+", Sept 25th 2013" ) ; 
    process.exit(0) })
.parseSystem(); // parse command line

//Load configuration file SYNCHRONOUSLY because there is nothing to do without the configuration
if( opt.options.verbose ) console.info( "load configuration files " + ( opt.options.configuration_file || "configuration.json" )) ; 
var configurationFile = fs.readFileSync( opt.options.configuration_file || "configuration.json" ) ; 
configuration= JSON.parse( configurationFile ) ; 
//overide configuration files with command line options
for( var i in opt.options ) {
    if( opt.options[i] ) 
	configuration[i] = opt.options[i] ; 
}



global.start = start ; 

webrepl.createServer({port: (process.env.PORT || configuration.port)
		      , username: configuration.username
		      , password: configuration.password
		     });

console.log( "Welcome on board" ) ; 

if( !configuration.no_web ) {
    startWebServer( configuration.web_port ) ;  
}

fs.writeFile( __dirname + "/public/server/activeServers" , "" ) ; 

//startBrainServer( configuration.serveur_port ) ; 

process.on('exit', function() {
    console.log( "FIN DU MONDE " ) ; 


    //Stop brainstormings servers and brains
    data = fs.readFileSync( __dirname + "/public/server/activeServers" ) ;
    console.log( data ) ; 
    fs.writeFileSync( __dirname + "/public/server/activeServers" , "" ) ; 
});
process.on("uncaughtException", function( err ) {
    console.error( err ) ; 
    process.exit() ; 

} )
process.on('SIGINT', function() {
    console.log('');
    process.exit() ; 

});




function MetaData (metadata) {
    this.color = "red"        ;
    this.timestamp = (new Date()).getTime()       ; 
    this.authors = "Anonymous" ; 
    for( var i in metadata )  {
	this[i] = metadata[i] ;
    }
}
function Node (content, metaData) {
    this.metaData = new MetaData (metaData) ; 
    this.content  = content ;
    this.id       = "80303.1"
}



//Create a minimal webserver to serve html interfaces.
function startWebServer( port ) {
    if( configuration.verbose ) console.info( "Start web server on port : " + port ) ; 
    var file = new nodeStatic.Server();
    require('http').createServer( function( request, response ) {
    	request.addListener( 'end', function() {
    	    file.serve( request, response );
    	}).resume();
    }).listen( port );
}

//Create childprocess for the brainserver 
function startBrainServer( directory, port ) {
    var server = cp.fork('server/app.js', ["--logs="+directory, "--managed", "--port="+port ]);
    server.on("join", function (name) {
	console.log("Manager here : someone join the brainstorming " + name ) ; 
	
    })
    
    server.on("start", function (name) {
	   console.log("Manager here : Server is started") ; 	
    })
}


function startBrainAssistant( name, server ) {
    var brainAssistant = cp.fork('clients/brains/'+name+".js", ["--port="+server] ) ;
}

function createBrainstorming( directory, type, groupId, title, theme, sandbox ) {
    if(! fs.existsSync(  __dirname + "/public/server/logs/" + directory + "/last/" ) ) {
	fs.mkdirSync( __dirname + "/public/server/logs/" + directory ) ;  
	fs.mkdirSync( __dirname + "/public/server/logs/" + directory + "/last/" ) ;
    }


    var filename = groupId+".txt" ;
    if( sandbox ) {
	filename = "sandbox_" + filename ; 
    } else {
	filename = "groupe_" + filename ; 
    }


    fs.writeFileSync( __dirname + "/public/server/logs/" + directory + "/last/"+ filename ,
		      JSON.stringify({ nodes : [ new Node( title, {Authors : "brainManager"}  ) ]
				       , links: []
				       , users: [] 
				       , title: title
				       , theme: filename 
				       , type : type 
				       , sentencesCount : 0 
				       , wordsCount : 0 
				       , initT : (new Date).getTime() 
				     })) ;
//    process.exit(0) ; 


    startBrainServer( directory, 8800 + groupId ) ;  
} 


function checkAllSession() {
    fs.readDir(__dirname+ "/public/server/logs/", function( err, files ) {
	var sessionLogs = {}
	, count = 0 ; 

	if( err ) {
	    console.log( "Something happened! " ) ; 
	    console.log( err ) ; 
	    return ; 
	}

	
	for( var i in files ) {
	    console.log( files[i] ) ; 
	    sessionLogs[ files[i] ] = {} ;
	    count ++ ; 
	    
	    fs.readDir( files[i], function() {
		
	    })
 	    
	}

	

    })

}



var id = 5 ; 

function start( type, groupeId, title, sandbox ) {
    console.log( "start %s, %d %s %s" , type, groupeId, title, sandbox )  
    var typeconverter = {
	control : 	"control" 
	, expA : "DennisHidden" 
	, expB : "DennisAnonym"
	, expC : "DennisVisible"
    }
    groupeId = groupeId || id++ ; 
    title = title || "Les sports du futur"
    console.log("Start brainstorming on localhost:" + (8800 + groupeId) + "/clients/html/"  )
    createBrainstorming( typeconverter[type]+ "_"+groupeId
			 , typeconverter[type]
			 , groupeId
			 , title			 
			 , "brainStormingTheme"
			 , sandbox ) ;
    if( type != "control") 
	setTimeout( startBrainAssistant, 10000,  "Dennis", 8800 + groupeId  ) ;  
}

function help()  {
    console.log( "StartExperimentA( nº de groupe ) ; " )  ; 
}




