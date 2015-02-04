function Bond (src, dst, label) {

    this.src = src; 
    this.dst = dst; 
    this.length = 1 ; 
    
    this.label = label ; 
    
    this.inspect = function() { return this.src.label.type.slice(0,3) + ":" + this.src.label.lemma 
				+ "==("+( ( this.label )? this.label.data : "XXXX") + " "  + ~~(100*this.length)/100 + ")==>" 
				+ this.dst.label.type.slice(0,3)   + ":" + this.dst.label.lemma +    "\n";}
}
module.exports = Bond ; 
