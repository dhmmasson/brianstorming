var export1 = { 

	server : function( io ){
	var version = "0.3" ;

	var fs = require('fs')
	, cp  = require('child_process') ;
	opt = { options : {verbose : true , logs:"dir" }}

	util = { inspect : function ( obj ) {
		if( !obj ) return "undefined"
		if (typeof obj.inspect == "function" ) return obj.inspect() ; 
		if (typeof obj.toString == "function" ) return obj.toString() ; 
		return obj ; 
	    }} 

	if( opt.options.verbose ) ; 

	var logsPath = opt.options.logs || "" ; 
	if( logsPath.length > 0 && logsPath[logsPath.length-1] != "/" ) logsPath += "/" ;


	try {
	    fs.mkdir( __dirname + "/logs/"+logsPath, function( err, data ) {  console.log( "fs.mkdir + " + err ) } ) ;
	} catch (err) {
	    console.log( "Logs dir exist, possible overwrite" ) ; 
	}


	var pathLast   = __dirname + "/logs/"+logsPath+"last/" ;
	var pathStatus = __dirname + "/logs/"+logsPath+"status.json" ;

	var port =  ~~( opt.options.port )  || 8888 ; 
	//var io = require('socket.io').listen( port ,  { log: false });

	var hasChanged = true ; 
	console.log( "NodeManager_"+version+", Sept 25th 2013" ) ; 
	console.log( "Server started on port " +  opt.options.port ) ; 



	fs.appendFile( __dirname + "/activeServers" , opt.options.port + "\n") ; 


	function keys (o){
	   if (o !== Object(o))
	      throw new TypeError('Object.keys called on non-object');
	   var ret=[],p;
	   for(p in o) if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);
	   return ret;
	}


	function maintenance( socket ) {
	//    console.log("maintenance") ; 
	    if( ! hasChanged ) 
		return 
	    hasChanged = false 
	    saveLogs() ; 
	    status() ; 

	}
	maintenance() ; 



	var logs = {} ; 


	function status ( socket ) {
	 //    var result = [],
	 //    i = 0 ; 
	 //    for( var name in logs ) {
		// result[i] = {} ; 
		// for( var j in logs[name] ) {
		//     if( (j == "nodes") || (j == "links") ) continue ; 
		// 	result[i][j] = logs[name][j] ; 
		// }
		// i++ ; 
	 //    }
	 //    fs.writeFile( pathStatus, JSON.stringify( result )
		// 	 , function (err) {
		// 	     if (err) throw err;
		// 	 //    console.log('status saved!');
		// 	 });  
	 //    io.sockets.emit("status", result) ; 
	 //    return result ; 
	}


	function saveLogs () {
	//     var t = (new Date()).getTime()
	//     var pathBackUp =  __dirname +  "/logs/"+logsPath+""+t  ;
	// //    fs.mkdirSync(pathBackUp) ;
	//     pathBackUp+="/" ;
	//     for (var i in logs) {
		
	// 	var data = JSON.stringify(logs[i]) ;
		
	// //	fs.writeFile(pathBackUp+i, data) ;
		
	// 	fs.writeFileSync(pathLast+i, data) ;
	//     }
	}

	function loadLogs () {
	 //    function loadFiles() {
		// return function (err, files) {
		
		//     if (err) { 
		// 	console.warn("first call, no logs to read") ; 
		// 	try {
		// 	    fs.mkdirSync(pathLast) ;
		// 	} catch ( err ) {
		// 	    console.log( "dir last/ already exists" ) ; 
		// 	}
		//     }
		//     for (var i in files) {
		
		// 	console.log(files[i]) ;
		// 	if (files[i] ==".svn")continue ; 
		// 	if (files[i] ==".DS_Store")continue ; 
		// 	logs[files[i]] = "" ;

		// 	function readFile (err, data) {
		// 	    file = this ; 
		// 	    if (err) throw err;
		// 	    console.log( "read " + data.length + " bytes from " + file  ) ; 
		// 	    logs[file] = JSON.parse(data);
		// 	    if( opt.options.verbose ) console.log(logs[file]) ;
			    
		// 	    if( opt.options.verbose ) console.log(logs[file].nodes) ;
		// 	    console.log("Create a " + logs[file].type +" brainstorming " ) ;
		// 	    if(logs[file].type.match("Brain:") ) {
		// 		setTimeout( 
		// 		    function () { cp.fork("clients/brains/Dennis.js", ["--port="+opt.options.port, "--session="+ this ] ) ; }.bind(file)
		// 		    , 3000 ) 

		// 	    }
		// 	}

		// 	fs.readFile(pathLast+files[i], readFile.bind( files[i] )  ) ;
		//     }

		// }
	 //    }
	 //    fs.readdir(pathLast, loadFiles())
	}



	loadLogs() ; 
	if( opt.options.managed ) {
	    
	    
	}
	    setInterval( maintenance, 10000 ) ; 

	io.sockets.on('connection', function (socket) {
		if( ! socket.request.user.logged_in ) return ; 

		

	    //----CONNECTION-------------------------------------------------
	    if( opt.options.verbose ) {
			console.log("New connection from " ,  socket.request.user.nickname ) ; 
	    }



	    //----LIST BRAINSTORMINGS---------------------------------------
	    socket.on("list", function () {
			if( opt.options.verbose ) console.log("list")
			if( opt.options.verbose ) if( opt.options.verbose ) console.log (keys(logs)) ;
			var aa = keys(logs)//io.sockets.manager.rooms).slice(1) ; 
			socket.emit("active_brainstormings",{brainstorming : aa} ) ;
	    })



	    socket.on("save", function( data )  {
			saveLogs() 
	    })
	    //ferme un brainstorming (inactive + save ) 
	    socket.on("close", function( data ) {
		if( logs.hasOwnProperty( data.name )  ) {
		    logs[name].active = false ; 
		    saveLogs() ; 
		}
	    })
	    socket.on("load", function( data )  {
			loadLogs() 	
	    })
	    //----JOIN BRAINSTORMING---------------------------------------
	    socket.on("join", function (data) {
			hasChanged = true ; 
			if( opt.options.verbose ) console.log("join " + data.name)
			//Client is already in another brainstorming sessions
			var name2 = getCurrentRoom (socket) ;
			if (name2) {
			    console.warn("Please leave brainstorming " + data.name + " before join a new brainstorming");
			    socket.emit("error",{"message": "Please leave brainstorming " + data.name + " before join a new brainstorming"});
			    return ; 
			}

			if (typeof data == "Object") 
			    name = data ;
			else 
			    name = data.name ;
			//Brainstorming sessions should have been created prior to joining
			console.log( "joining " + name + " from " + util.inspect(data) ) 
			if (logs.hasOwnProperty(name)) {
			    logs[name].active = true ; 
			    socket.join (name) ; 
			    socket.emit ("title", {data:{ title : logs[name].title
							  , initT : logs[name].initT
							  , type : logs[name].type
							  , deltaT : logs[name].deltaT   }} ) 
			    socket.emit ("nodes", {data:logs[name].nodes} ) 
			    socket.emit ("links", {data:logs[name].links} ) 
			    if( data.user ) 
				logs[name].users[data.user.id] = data.user
			    return ; 
			} else {
			   
			    console.warn("Please join existing brainstorming (list ) " +  getCurrentBrainstorming());
			    socket.emit("error", {message:"Please join existing brainstorming (list)" + getCurrentBrainstorming()});
			    return ; 
			}
	    })

	    socket.on("quit", function () {
		hasChanged = true ; 
		var name = getCurrentRoom(socket) ;
		if (name) 
		    socket.leave(name) ; 
		else {
		    console.warn("Please join existing brainstorming before leaving");
		    socket.emit("error", {message : "Please join existing brainstorming before leaving"});
		    return ; 
		}
	    })

	    socket.on("status", status) ;


	    //Add information about a user
	    socket.on("user", function ( data ) {
			hasChanged = true ; 

			console.log( "#### " + data.name + " user : " +  data.info.id ) 
			
			//Add information about the user
			if ( !logs[data.name] ) {
			    maintenance( socket ) ; 

			    if  ( !logs[data.name] ) {
			    console.log( "error no brainstorming with that name ")
			    console.log( data  ) ; 
			    console.log( data.name  ) ; 
			    console.log( "_____" ) ; 
			    return ;
			    }
			}
			if( ! logs[data.name].users[data.info.id] ) {
		//	    console.log("create a new user")
			    logs[data.name].users[data.info.id] = {
				username : data.username
				, sentencesCount : 0
				, wordsCount : 0
				, info : data.info
			    };
			}

			for( var i in data.info ) {
		//	    console.log("update " + i )
			    logs[data.name].users[data.info.id].info[i] = data.info[i] ;
			}
		//	console.log( logs[ data.name ].users )
			saveLogs() ; 
	    })

		      

	    //----CREATE NEW BRAINSTORMING---------------------------------
	    socket.on("create", function (data) {


		hasChanged = true ; 
		if (logs.hasOwnProperty(data.name)) {
		    console.warn("Brainstorming "+ data.name + " already existing") ;
		    socket.emit("error", {message:  "Brainstorming "+ data.name + " already existing"}) ;
		} else {
		    if( !data.data ) {
		    logs[data.name] = {"nodes":[]
				       ,"links":[]
				       , users: {}
				       , title: data.title || data.name 
				       , type : "UserCreated"
				       , initT : (new Date()).getTime()  
				       , active : true } ; 
		    } else { 
			logs[data.name] = data.data ; 
		    
			console.log("Create a " + data.data.type +" brainstorming " ) ;
			if( data.data.type.match("Brain:")  ) {
			    console.log("fork a dennis " + "clients/brains/Dennis.js" +  "--port="+opt.options.port +  "--session="+ data.name  ) ;
			    setTimeout( 
				function () { cp.fork("clients/brains/Dennis.js", ["--port="+opt.options.port, "--session="+ this ] ) ; }.bind( data.name )
				, 3000 ) 
			}
		    }

		    saveLogs() ; 
		    socket.join (data.name) ; 	


		    socket.emit("error", {message:  "success "+ data.name + " has been created"}) ;
		}
	    })


	    

	    //----DISPATCH MESSAGE IN THE ROOM-----------------------------
	    socket.on('message', function (data) {	
		if( opt.options.verbose ) console.log("message is osbolete") 
		socket.emit("error", {message : "message is obsolete"});
		saveLogs () ; 
		return ; 
	    });

	    socket.on("node", function (data) {
		addElement("nodes",socket,data) ;
	    })

	    socket.on("link", function (data) {
		addElement("links",socket,data) ;
	    })
	    socket.on("nodes", function (data) {
		for (var i in data.data)
		    addElement("nodes",socket,data.data[i]) ;
	    })
	    socket.on("links", function (data) {
		for (var i in data.data)
		    addElement("links",socket,data.data[i]) ;
	    })

	    //----DISCONNECT----------------------------------------------
	    socket.on('disconnect', function () {
		saveLogs() ; 
	    });
	});


	function getCurrentRoom (socket) {
	    if (keys(io.sockets.manager.roomClients[socket.id]).length > 1) 
		return keys(io.sockets.manager.roomClients[socket.id])[1].slice(1)  ; 
	    return null ;
	}


	function addElement(type, socket, data) {
	    hasChanged = true ; 
	    var name = getCurrentRoom(socket);
	    if (name) {
		logs[name][type].push(data) ;
		if( type == "nodes") {
			var userId = data.id.split(".")[0] ; 

		    logs[ name ].users[ userId ].sentencesCount ++ ; 
		    logs[ name ].users[ userId ].wordsCount += data.content.split(" ").length ; 

		    logs[ name ].sentencesCount = (logs[ name ].sentencesCount || 0) +1
		    logs[ name ].wordsCount = (logs[ name ].wordsCount || 0) +1
		}

		if( opt.options.verbose ) console.log("add " + data)
		socket.broadcast.in(name).emit(type,{data:[data]});
		return ; 
	    } else {
		console.warn ("Please join existing brainstorming (get_active_brainstorming)");
		socket.emit("error", {message :"Please join existing brainstorming (get_active_brainstorming)"});
	    }
	}


	function getCurrentBrainstorming() {
	 return  a = keys(io.sockets.manager.rooms).slice(1) ; 

	}

}

}

module.exports = export1 ; 