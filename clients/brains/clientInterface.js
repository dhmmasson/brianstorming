var io = require( "socket.io-client" ) ;
var util = require("util") ; 
function clientBrainstorming( address_optional ) {
    this.address = address_optional; 
    //Actions
    //Create the socket to connect t
    this.connect = function ( address_optional ) {
	if( address_optional ) this.address = address_optional ; 
	//Create Socket
	this.socket = io.connect( this.address ) ;
	//Bind processors
	this.socket.on( "connect"
			, this.onConnectProcessor.bind( this ))
	this.socket.on( "active_brainstormings"
			, this.onActiveBrainstormingProcessor.bind( this )) ;
	this.socket.on( "message"
			, this.onMessageProcessor.bind( this )) ; 
	this.socket.on( "nodes" 
			, this.onNodesProcessor.bind( this )) ; 
	this.socket.on( "links" 
			, this.onLinksProcessor.bind( this )) ; 
	this.socket.on( "error" 
			, this.onErrorProcessor.bind( this )) ;
	//Deprecated, for backward compatibility will clean the unique datum to an array of itself to be processed by onNodes (resp. onLinks)
	this.socket.on( "node" 
			, this.onNodeProcessor.bind( this )) ; 
	this.socket.on( "link" 
			, this.onLinkProcessor.bind( this )) ; 
  	
	//Create a new Brainstorming 
	this.createNewBrainstorming = function( brainstormingName ) {
	    this.socket.emit( "create"
			      , { name : brainstormingName }) ;
	}
	this.joinBrainstorming = function( brainstormingName ) {
	    this.socket.emit( "join"
			      , { name : brainstormingName }) ;
	} 
	this.sendNode = function( data ) {
	    
	    this.socket.emit( "node", data ) 
	} 
	this.sendLink = function( data ) {
	    this.socket.emit( "link", data ) 
	} 
	
    }
    //Processors : call user definer handlers if exists, else or if handler return false, do some default processing
    //Default: on connection ask for the list of active brainstormings
    var userDefined = function( userDefinedHandler, data ) {
	if( typeof userDefinedHandler === "function" ) 
	    return userDefinedHandler( data ) ;
	return false 
    }
    this.onConnectProcessor = function( data ) {
	if( userDefined( this.onConnectHandler, data )) 
	    return ;
	//DEFAULT: 
	this.socket.emit( "list", "" ) ; 
    }
    //On receiving the list of active process, connect by default to one of the brainstorming
    this.onActiveBrainstormingProcessor = function( data ) {
	this.activeBrainstormings = data.brainstorming ; 
	if( userDefined( this.onActiveBrainstormingHandler, data )) 
	    return ;
	//DEFAULT: 
	if( this.activeBrainstormings instanceof Array 
	    && typeof this.activeBrainstormings[0] === "string" ) {
	    this.joinBrainstorming( this.activeBrainstormings[0] ) ; 
	}
    }
    //On message is obsolete, it should not be used since version 1.2 
    this.onMessageProcessor = function( data ){
	console.warn( "onMessage is deprecated!" ) 
	if( userDefined( this.onMessageHandler, data )) 
	    return ;
	//DEFAULT: print the message
	console.log( util.inspect( data )) ; 
	
    }
    //Default: output to the console 
    this.onNodesProcessor = function( data ) {
	if( userDefined( this.onNodesHandler, data.data )) 
	    return ; 
	//DEFAULT: 
	for( var i in data ) {
	    console.log( util.inspect( data[i] )) ; 
	}
    }
    this.onLinksProcessor = function( data ) {
	if( userDefined( this.onLinksHandler, data.data )) 
	    return ; 
	//DEFAULT: 
	for( var i in data ) {
	    console.log( util.inspect( data[i] )) ; 
	}
    }
    this.onErrorProcessor = function( data ) {
	if( userDefined( this.onErrorHandler, data ) ) 
	    return ; 
	//DEFAULT: 
	console.error( util.inspect( data )) ; 
    }
    //Even if user defined handler return false, the client will clean itself 
    this.onDisconnectProcessor = function( data ) {
	userDefined( this.onDisconnectHandler, data ) ; 
	delete this.socket 
	delete this.createNewBrainstorming ;
	delete this.joinBrainstorming ;
	delete this.sendNode ;
	delete this.sendLink ;
    } 

    //DEPRECATED: should be deprecated since 1.2 
    this.onNodeProcessor = function( datum ) {
	this.onNodesProcessor( [ datum ] ) ; 
    }
    this.onLinkProcessor = function( datum ) {
	this.onLinksProcessor( [ datum ] ) ; 
    }
}

module.exports = clientBrainstorming ; 
