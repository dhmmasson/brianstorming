Object.defineProperties(Array.prototype, {
    remove : {
	enumerable : false 
	, value : function(from, to) {
	    var rest = this.slice((to || from) + 1 || this.length);
	    this.length = from < 0 ? this.length + from : from;
	    return Array.prototype.push.apply(this, rest);
	}
    }
})
