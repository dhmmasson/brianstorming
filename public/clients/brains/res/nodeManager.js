//require("./arrayutilities") ; 
var prototype = require( "prototype" ) ; 
var Node = require( "./node.js" )  ;

function NodeManager ( nodes ) {
    this.nodes = [] ; 

    
}
NodeManager.prototype.push = function ( node, label ) {
    if ( typeof node === "string") node = new Node( node, 0, 0 ) ; 
    if ( label ) node.label.push(label) 
    node.id = this.nodes.length ;
    this.nodes[ node.id ] = node ; 
    return node.id ; 
}

NodeManager.prototype.remove = function ( node ) {
    //TODO: check that node belong there, that it is only once and so on 

    //Clean up links 
    for( var i in node.links ) 
	manager.links.remove( node.links[i] ) ;

    console.log( "about to remove : " + util.inspect( this.nodes[ node.id ] )) ; 
    this.nodes[ node.id ] = undefined ; 
    delete node ; 
}

NodeManager.prototype.get = function ( key,noActivation ) {
    var result = [] ; 
    this.iterate( function( node ) {
	if( node.data === key ) {
	    if( !noActivation ) {
		node.activation = Math.sqrt( node.activation ) ; 
	    }
	    result.push( node ) ; 
	}
    }) ; 
    return result[0] ; 
}
NodeManager.prototype.exists = function( node ) {
    return this.nodes[ node.id ] === node ; 
} 
NodeManager.prototype.iterate = function( callback ) {
    for( var i in this.nodes ) {
	var node = this.nodes[i] ;
	if( node ) 
	    if ( callback( node, i, this.nodes)) break ; 
    }
}


//--------------------------------------------------------------------------------
function linksManager () {
    this.data = []
}
//

linksManager.prototype.push = function ( Bond ) {
    //manager 
    this.data.push( Bond ) ; 
}
//--------------------------------------------------------------------------------

function CodeRack2 ( ) {
    this.data = [] ; 
}
CodeRack2.prototype._each = function( iterator ) {
   for ( var i = 0 ; i < this.data.length ; i++ ) iterator( this.data[i] ) ; 
}
CodeRack2.prototype.push = function ( ant, urgency ) {
    ant.urgency = urgency ;
    this.data.push(ant) ;
}
CodeRack2.prototype.remove = function ( nodeOrIndex ) {

    if ( typeof nodeOrIndex !== "number" ) {
	for ( var i in this.data ) {
	    if ( this.data[i] === nodeOrIndex ) {

		return this.remove(i*1) ; 
	    }
	}
	return -1 
    } 
    if ( nodeOrIndex < this.data.length ) return this.data.remove( nodeOrIndex ) ;  
    console.log("error") ; 
}


var manager = {
    workspace : new NodeManager ()
    , relationalWorkspace : new NodeManager ()
    , dictionnary : new NodeManager () 
    , codeRack : new CodeRack2 ()
    , links : new linksManager ()
    , sentences : [] 
}
// manager.

CodeRack2.prototype.inspect = function () {
    var str = "[ : \n" ;
    for( var i in this.data ) 
	str += "("+~~(100*this.data[i].urgency( manager )) / 100 +")\t" +  ( ( this.data[i].name ) ? this.data[i].name : i ) + ",\n"
    str += "]" ;
    return str ;

}

manager.print = function( level ) {

}
manager.links.push = function( bond ) {
    if( typeof bond.src === "string" ) bond.src = manager.dictionnary.get( bond.src )  ; 
    if( typeof bond.dst === "string" ) bond.dst = manager.dictionnary.get( bond.dst )  ; 
    if( typeof bond.label === "string" ) bond.label = manager.dictionnary.get( bond.label )  ; 

    
    bond.src.links.push(bond) ;
    bond.dst.links.push(bond) ;
    bond.label.links.push(bond) ;

    this.data.push( bond ) ;
}
manager.links.remove = function( bond ) {
    var toRemove = [] ; 
    bond.src.removeLink( bond )  ; 
    bond.dst.removeLink( bond )  ; 
    bond.label.removeLink( bond )  ; 
    for( var i in this.data ) {
	if( bond === this.data[i] ) {
	    console.log( "???????remove " +i+ "  " + util.inspect(this.data[i]) + "?&5!@#$%?&*(*?%$#@#%?&*()(*&?$#@!@#$%?&*()(*$@!@#$%?&*()*$@!@#$%?&*()(*?%$" );
	    this.data.remove(i) ; 
	    i = 0 ; 
	}
    }
    
}

manager.propagateActivation = function () {
    var meanNbLinks = this.links.data.length / ( this.dictionnary.nodes.length + this.workspace.nodes.length ) ;
    this.meanNbLinks = meanNbLinks ; 


   for( var i in this.links.data ) {
	var link = this.links.data[i] ;
	link.length = 1/(link.label.activation || 0) ; 
    } 
   for( var i in this.links.data ) {
	var link = this.links.data[i] 
	, delta = ( link.src.activation - link.dst.activation ) / 6 ;
	delta =delta* ( link.length || 1 )  ;

	link.src.dActivation += -delta ; // Math.max( 0, -delta ) ;  
	link.dst.dActivation += +delta ; // Math.max( 0, delta ) ;  
	link.label.dActivation += Math.abs( delta / 4 ) ; 
	
    }
    var decay = Math.max ( Math.min( 0.9 , this.decay ) , 0 )  ; 
    var updateNode = function ( nodeManager ) {
	nodeManager.iterate( function(node) {
	    if (!node) { console.log(i + " doe's not exist" ) ; return false ; }
	    if (node.dActivation > 0 ) node.activation = Math.sqrt(node.activation) ; 
//	    node.activation += node.dActivation ; 
	    node.activation *= ( 1 - decay )  ; 
	    node.dActivation = 0 ; 
	    node.satisfaction = node.links.length / meanNbLinks ; 
	    if( isNaN( node.satisfaction ) ) console.log( node.data + " " + node.links + " /" + meanNbLinks )  ; 
	})
    }
    updateNode( this.workspace ) ; 
    updateNode( this.relationalWorkspace ) ; 
    updateNode( this.dictionnary ) ; 

 
}

module.exports = manager ; 
