//The Node represents everything
function Node( data, temperature, activation, label ) {
    this.data = data || "" ;
    this.temperature = temperature ; 
    this.activation  = activation ; 
    this.adjacentNodes = [] ; 
    this.label = label ; 
    this.dActivation = 0 ;
    this.links = [] ;
    this.satisfaction = 1 ; 
    if( !this.label.lemma ) this.label.lemma = data ; 

    this.salience = function() {
	return this.activation / Math.max(0.1, this.satisfaction)  ; 
    }
    this.inspect = function() {
	return "<"+(this.label.type||"node")+ ":" 
	    + (( typeof this.label.lemma == "string" ) ? this.label.lemma : this.data )
	    + "("+this.label.pos+")>\t\t" 
	    + ~~(100*this.salience()  )/100 + "\t=\t" 
	    + ~~(100*this.activation   )/100 + " /" 
	    + ~~(100*this.satisfaction  )/100+ "\t"
	    + this.links.length  
	    + "</node>\n"
    }
    this.removeLink = function( link ) {
	for(var i in this.links ) {
	    if( this.links[i] === link ) return this.links.remove(i) ; 
	}
	return null ; 
    } 
    this.activate = function( ) {
	this.activation = Math.sqrt( this.activation ) ; 
    }
}

module.exports = Node ; 

