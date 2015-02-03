

function tryInitSocket (e) {

    var address = (e.currentTarget.value) ;
    address = (address.match(/\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}:\d{1,4}/)) ;
    if (address) {
	$("#GoButton").prop( "disabled", false );
        localStorage["address"]=address;
        localStorage["name"]= $("#name").val() || "Anonymous" + ~~(Math.random() *1000) ; 
	

    }
}
; 
   var client = new clientBrainstorming( location.hostname+":8800") ;
    
function boot() {

    
    setInterval( function() { client.getStatus() }
		, 10000)
        
    var hostname = window.location.hostname ; 
 
    client.onActiveBrainstormingHandler = function() { return true ; } ;

    client.connect() ; 
    client.onErrorHandler = function ( data ) {
	if( !data ) return  
	$("#error").text(data.message) ;
	$("#error").show(
	    "explode"
	    , {}
	    , 500 
	    , function () { 	$("#error").hide()  }
	) 

	return true ; 
    } 
    
    client.onStatusHandler = function ( data ) {
	console.log( data ) ; 
	$("#status").empty () ; 

	str = "	<p>groupe _groupeId_ (_theme_) _type_  : #sentences : _sentencesCount_ </p>"
	for( var i in data ) {
	    var appendStr = str ; 
	    for( var j in data[i] ) {
		console.log( j ) 
		var reg =  new RegExp("_"+ j +"_", "g") ;
		console.log( reg )  ; 
		appendStr = appendStr.replace( reg , data[i][j] ) 
	    }
	    $("#status").append( appendStr ); 
	}

	

	var mylist = $('#status');
	var listitems = mylist.children('p').get();
	listitems.sort(function(a, b) {
	    return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
	})
	$.each(listitems, function(idx, itm) { mylist.append(itm); });
	
	console.log( data ) ; 	
	return true ; 
    }


    $("#adminBox").css("display", "block") ;
    $("#GroupId").val(~~localStorage.groupId + 1) ; 
    $("#Title").val( localStorage.title) ; 
    
    function startExperiment(sandbox) {

	localStorage.groupId = ($("#GroupId").val()) || localStorage.groupId ; 
	localStorage.title = $("#Title").val() ||  localStorage.title ; 
	type = $("input:radio:checked")[0].id || "control"; 
	deltaT = ~~($("#deltaT").val() )|| 900; 

	console.log( type ) ; 

	var typeconverter = {
	    control : 	"control" 
	    , expA : "Brain:DennisHidden" 
	    , expB : "Brain:DennisAnonym"
	    , expC : "Brain:DennisVisible"
	}
	
	var filename = localStorage.groupId+".txt" ;
	if( sandbox ) {
	    filename = "sandbox_" + filename ; 
	} else {
	    filename = "groupe_" + filename ; 
	}


	client.createNewBrainstorming( 
	    { name : filename 
	      , data : {
		   "nodes":[]
		  ,"links":[]
		  , users: {}
		  , groupeId : localStorage.groupId
		  , theme : ((sandbox) ? "sandbox" : "session")
		  , title: localStorage.title || "Random Title"
		  , type : typeconverter[type] 
		  , initT : (new Date()).getTime()
		  , deltaT : deltaT 
		  , sentencesCount : 0 
		  , wordsCount : 0   
		  , active : true }} ) 
	
    }

    $("#sandbox").click(
	function() {
	    startExperiment( true ) ;
	}
    )
    $("#experiment").click(
	function() {
	    startExperiment( false ) ;
	}
    )




}
$(document).ready(boot);

/*
function frequency (gData) {
	signal = [] ;
	dft = new DFT(900, 1 )
 for( var i = 0 ; i < 1024 ; i++ ) signal[i] = 0 ; 
 for( var i = 0 ; i < gData.nodes.length ; i++ ) { signal[  ~~(( gData.nodes[i].metaData.timestamp - gData.initT  ) / 1000 )   ]    ++ }
 dft.forward(signal)
return dft.spectrum ; 	

}

function transformResultCsv( experiment ) {



	$.getJSON("/server/logs/testV3/last/"+experiment, function( data ) {

		var experimentResult = {}
		var usersResults = {} ; 
		var allTheBriquesUses = [] ;


		var initTserver = data.initT ; 


		for (var i = data.users.length - 1; i >= 0; i--) {
			var user = data.users[i]

			usersResults[i] = {} ;

			usersResults[i].realName = user.info.User_name ; 
			usersResults[i].id = user.info.id ;
			usersResults[i].age = user.info.User_age ; 
			usersResults[i].age = user.info.User_sex; 
			usersResults[i].participation = user.info.User_brainstormingParticipation ;

			//brique 
			var briqueUses = user.info.User_brique.split("\n") ;
			usersResults[i].nbUsageBRique = briqueUses.length ; 
			for( var j in briqueUses ) {
				allTheBriquesUses.push( 
					{ id: user.info.id + "." + j 
					,use: briqueUses[j]  });
			}


			//experiment 
			usersResults[i][user.theme].startTime = user.info.startTime ||   initTserver ; 
			usersResults[i][user.theme].endTime   = user.info.endTime   || ( initTserver + 900 * 1000 ); 

			userResults[i][user.theme].nbIdea = user.info.



		};


		





	})
   

}
//*/