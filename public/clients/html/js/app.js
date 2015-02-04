var io = require('socket.io').listen(8888,  { log: false });
function keys (o){
   if (o !== Object(o))
      throw new TypeError('Object.keys called on non-object');
   var ret=[],p;
   for(p in o) if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);
   return ret;
}

var logs = {} ; 
io.sockets.on('connection', function (socket) {
    //----CONNECTION-------------------------------------------------
    console.log("new connection") ; 




    //----LIST BRAINSTORMINGS---------------------------------------
    socket.on("list", function () {
	console.log("list")
	var aa = keys(io.sockets.manager.rooms).slice(1) ; 

	socket.emit("active_brainstormings",{brainstorming : aa} ) ;
    })




    //----JOIN BRAINSTORMING---------------------------------------
    socket.on("join", function (data) {
	console.log("join " + data.name)
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
	if (logs.hasOwnProperty(name)) {
	    socket.join (name) ; 	
	    socket.emit ("nodes", {data:logs[name].nodes} ) 
	    socket.emit ("links", {data:logs[name].links} ) 
	    return ; 
	} else {
	   
	    console.warn("Please join existing brainstorming (list ) " +  getCurrentBrainstorming());
	    socket.emit("error", {message:"Please join existing brainstorming (list)" + getCurrentBrainstorming()});
	    return ; 
	}
    })

    socket.on("quit", function () {
	var name = getCurrentRoom(socket) ;
	if (name) 
	    socket.leave(name) ; 
	else {
	    console.warn("Please join existing brainstorming before leaving");
	    socket.emit("error", {message : "Please join existing brainstorming before leaving"});
	    return ; 
	}
    })

    //----CREATE NEW BRAINSTORMING---------------------------------
    socket.on("create", function (data) {

	if (logs.hasOwnProperty(data.name)) {
	    console.warn("Brainstorming "+ data.name + " already existing") ;
	    socket.emit("error", {message:  "Brainstorming "+ data.name + " already existing"}) ;
	} else {
	    logs[data.name] = {"nodes":[],"links":[]} ; 
	    socket.join (data.name) ; 	
	}
    })




    //----DISPATCH MESSAGE IN THE ROOM-----------------------------
    socket.on('message', function (data) {	
	console.log("message is osbolete") 
	socket.emit("error", {message : "message is obsolete"});
	return ; 
    });

    socket.on("node", function (data) {
	addElement("nodes",socket,data) ;
    })

    socket.on("link", function (data) {
	addElement("links",socket,data) ;
    })
    socket.on("nodes", function (data) {
	console.log(data)
	console.log(data.data) 
	addElement("nodes",socket,data.data) ;
    })

    //----DISCONNECT----------------------------------------------
    socket.on('disconnect', function () { });
});


function getCurrentRoom (socket) {
    if (keys(io.sockets.manager.roomClients[socket.id]).length > 1) 
	return keys(io.sockets.manager.roomClients[socket.id])[1].slice(1)  ; 
    return null ;
}


function addElement(type, socket, data) {
    var name = getCurrentRoom(socket);
    if (name) {
	logs[name][type].push(data) ;
	console.log("add " + data)
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
