var md5 = function( str ) {
	return str 
}

defaultBrainstorming = {
	  	title : "Default Title"
	,	participants : []  
	, 	creator : ""
	, 	id : "Hash#creator.timeStamp" 
	, 	public : true 
	, 	creationTime : 0 
	,	startTime : -1
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

	this.creationTime = Date.now() ; 
	this.id = md5( this.creator + ":" + this.creationTime )
}
Brainstorming.loadFromDb( id ) {
	brainstorming = db.brainstormings.find( { id : id }) ; 
	if( brainstorming ) {
		return ( new Brainstorming( brainstorming ) ) 
	}
	console.error( "No brainstorming with that id" ) 
	return new Brainstorming() ; 
}
Brainstorming.save( bs ) {
	db.brainstorming.update( {id : bs.id }, bs, {upsert:true} )
}

//Gestion des Messages
Brainstorming.prototype.addMessage( message ) {
	if( ! ( message instanceof Message ) ) {
		console.error( "Expected a message got : ", message)
		return -1 ; 
	}
	if ( ! Message.verifyMessage( message, this.id ) ) {
		console.error( "Message Invalid") ;
	}
	db.messages.save( message ) ; 
}  
Brainstorming.getMessages( bsId, author, date ) {
	return db.messages.find( { bs : bsId
							 , author : author
						  	 , timeStamp : { $gt : date } }) ;
}

Brainstorming.prototype.getMessagesSince( date ) {
	return Brainstorming.getMessages( this.id, undefined, date )
}  


//Gestion des liens
Brainstorming.prototype.addLink( link ) {
	if( ! ( link instanceof Link ) ) {
		console.error( "Expected a link got : ", link)
		return -1 ; 
	}
	if ( ! Link.verifyMessage( link, this.id ) ) {
		console.error( "link Invalid") ;
	}
	db.links.save( link ) ; 
}  
Brainstorming.getLinks( bsId, author, date ) {
	return db.links.find( { bs : bsId
							 , author : author
						  	 , timeStamp : { $gt : date } }) ;
}

Brainstorming.prototype.getLinksSince( date ) {
	return Brainstorming.getLinks( this.id, undefined, date )
}  



function Links( source, destination ) {
	this.source 
}

function Message( author, bs, text ) {
	this.text 		= text ; 
	this.author 	= author || defaultMessage.author ; 
	this.timeStamp 	= Date.now() ;
	this.bs 		= bs ;  
	this.id = md5( this.bs + ":" this.author + ":" + this.timeStamp )
}

Message.verifyMessage = function( message, brainstormingId ) {
	if( ! Participant.verifyAuthor( message.author )) 
		return false ;
	if( md5( brainstormingId + ":" message.author + ":" + message.timeStamp ) != message.id ) 
		return false ;
	return true ;
}
