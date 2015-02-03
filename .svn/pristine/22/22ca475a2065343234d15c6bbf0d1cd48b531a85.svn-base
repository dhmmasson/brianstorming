var fs = require("fs") ; 

function checkAllSession() {
    dirPath = __dirname+ "/server/logs/"
    fs.readdir(dirPath , function( err, files ) {
	var sessionLogs = {}
	, count = 0 ; 

	if( err ) {
	    console.log( "Something happened! " ) ; 
	    console.log( err ) ; 
	    return ; 
	}

	count = files.length ; 
	for( var i in files ) {
	    console.log( files[i] ) ; 
	    sessionLogs[ files[i] ] = {} ;

   
	    fs.readFile(dirPath +  files[i] + "/status.json" , function( err, data ) {
		if( err ) { count-- ;
			    return ;  }
		json = JSON.parse( data ) ; 
		sessionLogs[ this.name ] = json ; 
		count-- ; 
		if( count == 0 ) console.log( util.inspect( sessionLogs ) ) ; 
	    }.bind(
		{name : files[i], path : dirPath +  files[i] + "/last"  }
	    ) )
 	    
	}
    })
    
}


exports.check =  checkAllSession ; 
