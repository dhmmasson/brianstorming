$(function() {
    if( window.location.pathname == "/accueil.html" ) {

    console.log("vos information")
    $("body").append( "<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><h3>Vos information</h3> <ul id='infoPerso'>");
    for( var i in localStorage) {
        console.log( i + " : " + localStorage[i] +"<br>")
        $("#infoPerso").append( "<li>" + i + " : " + localStorage[i] +"<br>")
    }
}
}
);

function tryInitSocket (e) {

    var address = (e.currentTarget.value) ;
    address = (address.match(/\d{1,2}/));
    if (address) {
	if( localStorage["sandbox"] == "true" ) {
	    $("#GoButton2").prop( "disabled", false );
	} else {
	    $("#GoButton1").prop( "disabled", false );
	}
        localStorage["groupeId"]=address;
        localStorage["name"]= $("#name").val() || "Anonymous" + ~~(Math.random() *1000) ; 
	

    }
}
var countDown = 60 ; 
var countDownInterval = 0 ; 
function startCountDown () {
    $("#brique").unbind( "keyup", startCountDown ) ; 
    $(".lock").unbind( "keyup", startCountDown ) ; 
    if(!countDownInterval) {    
        countDownInterval = setInterval( function() {
    	countDown-- ; 
    	$("#remainingTime").text( countDown ) ; 
    	if( !countDown ) { 
    	    clearInterval( countDownInterval ) ; 
    	    $("#briqueNext").prop( "disabled", false );
             $("#combinaisonNext").prop( "disabled", false );
    	    $("#brique").prop( "disabled",true );
            $(".lock").prop( "disabled",true );
    	}
    	
        }, 1000 )
    }
}

function gatherInfo() {
    var namedElement =  $("*[name]:checked, *[name]:not([type=radio])") 
    try {
        var user = JSON.parse( localStorage["user"] || "{}" ) 
    } catch (err)  {
        user = {} ; 
    }
    for( var i = 0 ; i < namedElement.length ; i++ ) {
	console.log( namedElement[i].name +" " + namedElement[i].value ) 
	user[namedElement[i].name] = namedElement[i].value  
	localStorage["User_" + namedElement[i].name ] = namedElement[i].value ; 
    }
    localStorage["user"] =  JSON.stringify( user ) ; 
}

function next(e ) {
    e.stopPropagation() ; 
  
    var url = this ; 
    gatherInfo()  ; 
    console.log( window.location.origin + url ) ;
    window.location.assign( window.location.origin + url ) ;
  
    return false 

}

function boot() {




$("#name").val(localStorage["name"]|| "Anonymous" + ~~(Math.random() *1000))
$("#serveurAddress")
    .change(tryInitSocket)
    .keyup(tryInitSocket)
    .blur(tryInitSocket)
    .focus(tryInitSocket)
    .val(localStorage["groupeId"]||"")


    
    $("#infoBox").css("display", "block")
    $("#introNext").click(
	next.bind( "/questionnaire.html" ) 
    )
    $("#questionNext").click(
	next.bind("/brique.html" ) 
    )
    $("#briqueNext").click( next.bind( "/combinaison.html") ) 
    $("#combinaisonNext").click( next.bind( "/accueil.html") ) 
        

    $("#GoButton1").click(function(){  
	localStorage["sandbox"] =  true ; 
	window.location = window.location.origin + '/clients/html/simple.html' 
    })
    $("#GoButton2").click(function(){ 
	localStorage["sandbox"] =  false ; 
	window.location = window.location.origin + '/clients/html/simple.html' 
    })
    $("a").click( function () {
	console.log("hello") ;
	localStorage["sandbox"] =  false ; 

	$("#GoButton2").prop( "disabled", true );
	$("#GoButton1").prop( "disabled", false );

	event.stopPropagation() 
	return false ; 
    })

    
    $("#brique").keyup( startCountDown ) ;
    $(".lock").keyup( startCountDown ) ;
}
$(document).ready(boot);
