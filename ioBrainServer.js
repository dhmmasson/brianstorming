var MongoClient = require('mongodb').MongoClient;
var md5 = require('MD5');
var url = 'mongodb://localhost:27017/myproject';
var db 
, db_brainstorming =0
, db_messages = 0
, db_links = 0
, db_participants = 0  
MongoClient.connect(url, function(err, _db) {
	console.log("Connected correctly to server");
	db = _db ; 
  //db.close();

  db_brainstorming = db.collection('brainstorming');
  db_messages = db.collection('messages');
  db_links = db.collection('links');
  db_participants =  db.collection('participants');
});



defaultBrainstorming = {
	title : "Default Title"
	,	participants : []  
	, 	creator : ""
	, 	id : null
	, 	public : false 
	, 	creationTime : null 
	,	startTime : -1
	,	duration : 20*60 
}

participant = {
	name : "Jane Doe"
	, 	mail : "Jane.Doe@gmail.com"
	,	age  : 12
	, 	sex  : "Female"  
	, 	id   : 123
}

defaultMessage = {
	text : ""
	,	author : ""
	,	timeStamp : 0 	
	, 	bs  : "bs_id" 
	, 	id 	: "bs:au:tm" 
}

defaultLink = {
	source : "mid"
	, 	destination : "mid"

}


function Brainstorming( config ) {
	for( var i in defaultBrainstorming ) {
		this[ i ] = config[ i ] || defaultBrainstorming[ i ] ; 
	}

	if( !this.creationTime ) 	this.creationTime = Date.now() ; 
	if( !this.id )	this.id = md5( this.creator + ":" + this.creationTime )
}
Brainstorming.loadFromDb = function( id, err_cb, cb ) {
	brainstorming = db_brainstorming.find( { id : id }).toArray(function(err, docs) { 
		if( err ) { 

			console.error( "No brainstorming with that id" ) 	
			err_cb( err ) ; 

		} else {	
			cb( new Brainstorming( docs[0] ) ) 
		}
		
	}) ; 	
}
Brainstorming.loadBrainstormingLists = function ( creator, cb_echec, cb_succes ){
	brainstorming = db_brainstorming.find( {
		$or : [
		{public  : true }
		, {creator : creator }
		, {participants : creator }
		]
	}).toArray( function(err, docs) {
		if( err ) {
			cb_echec( err, docs ) ;
			return 
		}

		var created = []
		,   publics = []
		,   participated = [] ;
		for( var i = 0 ; i < docs.length ; i++ ) {
			bs = new Brainstorming( docs[i] ) ;
			if( bs.public  ) 							  publics.push( bs.toInfo() ) ;
			if( bs.creator == creator ) 			      created.push( bs.toInfo() ) ;

			if( bs.participants instanceof Array && bs.participants.contains( creator )) participated.push( bs.toInfo() ) ;
		}
		cb_succes( publics, created, participated  ) ; 
	} ) ;

}

Brainstorming.save = function( bs ) {
	console.log( "save", bs)
	db_brainstorming.update( {id : bs.id }, bs, {upsert:true} , function(err, result){
		if( err ) console.log( "can't save brainstorming ")
			console.log( result )
	} )
}
Brainstorming.prototype.toInfo = function() {
	return {
		title : this.title,
		nbParticipant : this.participants.length,
		startTime : this.startTime, 
		id : this.id,
		creator : this.creator, 
		duration : this.duration 
	}
}
Brainstorming.prototype.save = function() {
	Brainstorming.save( this ) ;
}
Brainstorming.prototype.addParticipant = function( participant ) {
	for( var i = 0 ; i < this.participants.length ; i++) {
		if( this.participants[i] == participant ) return 
	}
this.participants.push( participant ) ;
this.save() ; 
}

//Gestion des Messages
Brainstorming.prototype.addMessage = function( message ) {
	if( ! ( message instanceof Message ) ) {
		console.error( "Expected a message got : ", message)
		return -1 ; 
	}
	if ( ! Message.verifyMessage( message, this.id ) ) {
		console.error( "Message Invalid") ;
	}
	db_messages.save( message , function(err){
		if( err ) console.log( "can't save message ")
	} ) ; 
} 

Brainstorming.getMessages = function( bsId, author, date, cb ) {
	if( author )
		db_messages.find( { bs : bsId
			, author : author
			, timeStamp : { $gt : date } }
			).toArray( cb ) ;
	else 
		db_messages.find( { bs : bsId
			, timeStamp : { $gt : date } }
			).toArray( cb ) ;
}

Brainstorming.prototype.getMessagesSince = function( date , cb) {
	return Brainstorming.getMessages( this.id, undefined, date , cb)
}  


//Gestion des liens
Brainstorming.prototype.addLink = function( link ) {
	if( ! ( link instanceof Link ) ) {
		console.error( "Expected a link got : ", link)
		return -1 ; 
	}
	if ( ! Link.verifyMessage( link, this.id ) ) {
		console.error( "link Invalid") ;
	}
	db_links.save( link , function(err){
		if( err ) console.log( "can't save link ")
	} ) ; 
}  
Brainstorming.getLinks = function( bsId, author, date , cb) {
	return db_links.find( { bs : bsId
		, author : author
		, timeStamp : { $gt : date } }).toArray( cb )
}

Brainstorming.prototype.getLinksSince = function( date, cb ) {
	return Brainstorming.getLinks( this.id, undefined, date , cb)
}  



function Link( source, destination ) {
	this.source = source ; 
	this.destination = destination ; 
}

Link.verifyLink = function( link, cb_succes, cb_echec ) {
	db_messages.find( {
		$or : [
		{id : link.source }
		, {id : link.destination }
		]
	}).toArray( function(err, docs) {
		if( err ) 
			cb_echec( err, docs ) ;
		if( docs.length < 2 ) 
			cb_echec( err, docs)

		cb_succes( docs ) ; 
	} ) ;
}



function Message( author, bs, text ) {
	this.text 		= text ; 
	this.author 	= author || defaultMessage.author ; 
	this.timeStamp 	= Date.now() ;
	this.bs 		= bs ;  
	this.id = md5( this.bs + ":" + this.author + ":" + this.timeStamp )
}

Message.verifyMessage = function( message, brainstormingId ) {
	//if( ! Participant.verifyAuthor( message.author )) 
	//	return false ;
	if( md5( brainstormingId + ":" + message.author + ":" + message.timeStamp ) != message.id ) 
		return false ;
	return true ;
}

Object.defineProperty(Array.prototype, 'contains',  {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function( obj) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] === obj) {
				return true;
			}
		}
		return false;
	}
});


module.exports = { 

	Brainstorming : Brainstorming 

	, start : function( ioClient ) {


		function attachHandlers ( socket , author, authorizedBsId ) {			
			//rejoindre un brainstorming 
			socket.on("join", function( data ) {
				console.log( data )
				if( ! data.brainstorming ) {
					socket.emit("Error", {value : "Join Error : data.brainstorming is null"})
					return 
				}
				if( data.brainstorming != authorizedBsId && ! authorizedBsId.contains( data.brainstorming ) ) {
					socket.emit("Error", {value : "Join Error : " + data.brainstorming +" is not authorized "})
					return 
				}
				Brainstorming.loadFromDb( data.brainstorming, 
				//Error Callback
				function(){ 
					socket.emit("Error", {value : "Join Error : "+data.brainstoring+" is not an existing brainstorming"})
					return
				},
				function( brainstorming ) {
					activeBrainstorming =  brainstorming

					activeBrainstorming.addParticipant( author ) ;
					//Join the room
					socket.join( activeBrainstorming.id ) ;

					//Transmit all previous messages and all previous links
					socket.emit( "info", activeBrainstorming.toInfo() ) ;

					activeBrainstorming.getMessagesSince( 0 ,
						function(err, docs) {
							if( err ) socket.emit("Error", "can't fetch messages") ;
							else socket.emit( "messages", docs ) ;

						} )

					activeBrainstorming.getLinksSince( 0 ,
						function(err, docs) {
							if( err ) socket.emit("Error", "can't fetch links") ;
							else socket.emit( "links", docs ) ;

						} )
					
				})
			})
			//emettre un message dans un brainstorming 
			socket.on("message", function( data ) {
				console.log( data )
				if( activeBrainstorming == null ) {
					socket.emit("Error", {value : "join an existing brainstorming"})
					return ;
				}
				var message = new Message( author, activeBrainstorming.id , data.text ) ;
				activeBrainstorming.addMessage( message ) ;

				//If first Message update start time and update participants of that change
				if( activeBrainstorming.startTime == -1 ) {
					activeBrainstorming.startTime = message.timeStamp ;
					activeBrainstorming.save() ;
					ioClient.to( activeBrainstorming.id ).emit( "info", activeBrainstorming.toInfo() ) ;
				}
				ioClient.to( activeBrainstorming.id ).emit( "messages", [message] ) ;
				
				if( data.reference ) {
					var link = new Link( data.reference, message.id ) ;
					Link.verifyLink( link, function(){
						activeBrainstorming.addLink( link )
						ioClient.to( activeBrainstorming.id ).emit( "links", [link] ) ;
					}, function() {  
						socket.emit("Error", "Reference does not exist" ) ; 
					})
				}
			})
			socket.on("link", function( data ){
				if( activeBrainstorming == null ) {
					socket.emit("Error", {value : "join an existing brainstorming"})
					return ;
				}
				var link = new Link( activeBrainstorming.id , data.source, data.destination )
				Link.verifyLink( link, function(){
					activeBrainstorming.addLink( link )
					ioClient.to( activeBrainstorming.id ).emit( "links", [link] ) ;
				}, function() {  
					socket.emit("Error", "Link creation error" ) ; 
				})
			})
		}


	ioClient.on('connection', function (socket) {
		if( ! socket.request.user.logged_in ) return ; 


		author = md5(socket.request.user.id)
		console.log( "welcome " + author)
		attachHandlers( socket, author )


 		console.log('hello! ', socket.decoded_token.userId);
			
		author = "brian:" + socket.decoded_token.userId ; 
		attachHandlers( socket, author, socket.decoded_token.bsId )
	})
}}


// 	{"email":"dhm.masson@gmail.com",
// "email_verified":true,
// "name":"Dimitri Masson",
// "given_name":"Dimitri",
// "family_name":"Masson",
// "picture":"https://lh4.googleusercontent.com/-ZKJZWTSQt_8/AAAAAAAAAAI/AAAAAAAAAQI/nLdzCYB6lmM/photo.jpg",
// "gender":"male",
// "locale":"en",
// "clientID":"FZP0ifjqHEosYfO47yAcdY0tawm1ud6W",
// "user_id":"google-oauth2|103194617366512990837",
// "nickname":"dhm.masson",
// "identities":[{"access_token":"ya29.HAG2Hsfpde6pM0kLJRboeySYtq7zcxW5G4gMwezyvJNLcjwLpbhyr0-a4ZNhtCAsmVcsvJzx8IOveA",
// "provider":"google-oauth2",
// "expires_in":3599,
// "user_id":"103194617366512990837",
// "connection":"google-oauth2",
// "isSocial":true}],
// "created_at":"2015-02-07T15:06:10.239Z"}' }