

function tryInitSocket (e) {

    var address = (e.currentTarget.value) ;
    address = (address.match(/\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}:\d{1,4}/)) ;
    if (address) {
	$("#GoButton").prop( "disabled", false );
        localStorage["address"]=address;
        localStorage["name"]= $("#name").val() || "Anonymous" + ~~(Math.random() *1000) ; 
	

    }
}


function boot() {


    
    $("#adminBox").css("display", "block") ;
    $("#GroupId").val(~~localStorage.groupId + 1) ; 
    $("#Title").val( localStorage.title) ; 
    
    function startExperiment(sandbox) {

	localStorage.groupId = ($("#GroupId").val()) || localStorage.groupId ; 
	localStorage.title = $("#Title").val() ||  localStorage.title ; 
	type = $("input:radio:checked")[0].id || "control"; 

	console.log( type ) ; 
	$.post('http://localhost:8088/api', {id:1, jsonrpc: '2.0', 
					     method: "start("  , 
					     params:[  
						  "'"+ type  + "'," 
						 , localStorage.groupId + "," 
						 , "'"+localStorage.title+"'," 
						 , sandbox
						 , ");" ]}) 

  
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
