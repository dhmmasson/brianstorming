$( function () {

	clean() ; 



    var progressBar = $("#progress") ; 
	var progressIntervalHandle =  setInterval( progress, 1000) ;  

	var deltaX = 900 ; //px
	var deltaT = 900 ; //seconds


    progressBar.parent().css( {width : deltaX + "px" } ) ;
	if( typeof initT == "undefined" ) initT = ( new Date() ).getTime() ; 
    if( typeof deltaT == "undefined" ) deltaT = 900 ; 


    $("#q3Hide").click( function () { $("#questionnaireMessage3").toggleClass("active inactive") })
    $("#q3Show").click( function () { $("#questionnaireMessage3").toggleClass("active inactive")  })
	
    
    function progress () {
		var dt = (( new Date() ).getTime() - initT )/ 1000 ; 
		console.log( "dt/deltaT : %d/%d = %d %% ", dt, deltaT, ~~(dt/deltaT*100) ) 
		if ( dt > deltaT ) {


	    $("title").text("Le temps est écoulé");
	    clearInterval( progressIntervalHandle ) ; 
		localStorage.endTime = (new Date()).getTime()  ;


	    $("#send").text( " le brainstorming est terminé ") ;
	    $("#send").click( backToIndex ) ; 
//	    $("#send").prop("disabled", true ) ;
	   
	    


	    $("#proposition").prop("disabled", true ) ;


	    $("#progress").parent().hide() ; 

	
	    clean ( ) ; 


	    var finalise = function() { 
			clean() ; 
			gatherInfo() ; 
			client.usersRegistration( {
			    name : client.name 
			    , username : user  
			    , info : localStorage
			})
			setTimeout(backToIndex,60000) ;
			//backToIndex() ; 
	    }
	    var questionnaire3 = function () {
			clean () ;
			$("#questionnaireMessage3").show() ; 
			$("#questionnaireEnd3").click( finalise ) ; 
	    }
	    var questionnaire2 = function () {
			clean () ;
			$("#questionnaireMessage2").show() ; 
			$("#questionnaireEnd2").text("Suite") ;
			if( localStorage.type != "control") {
			    $("#questionnaireEnd2").click( function() {
				revealDennis() ; 
				questionnaire3() ; 
			    })
			} else {
			    $("#questionnaireEnd2").click( finalise ) ; 
			}
	    }
	    var questionnaire = function () {
			clean () ;
			$("#questionnaireMessage").show() ; 
			$("#questionnaireEnd").click( questionnaire2 ) ; 
	    }


	    var fct3 = createPrepareSelect( "best" , questionnaire) ; 
	    var fct2 = createPrepareSelect( "mostInspiring", fct3 ) ; 
	    var fct1 = createPrepareSelect( "mostSurprising", fct2 ) ; 
	    var fct = createPrepareSelect( "mostUtile", fct1 ) ; 
	    
	    if( localStorage.sandbox )
	    	finalise() 
	    else
			fct() ;
	}
	progressBar.css( {width : Math.min( deltaX, ~~(dt/deltaT *deltaX) ) + "px" } ) ;

    }
   
    function clean () {
		$("#selectbestIdeasMessage").hide() ; 
		$("#selectmostInspiringIdeasMessage").hide() ; 
		$("#selectmostSurprisingIdeasMessage").hide() ; 
		$("#selectmostUtileIdeasMessage").hide() ; 
		$("#questionnaireMessage").hide() ; 
		$("#questionnaireMessage2").hide() ; 
		$("#questionnaireMessage3").hide() ; 
		$(".idea").unbind("click") ;
		$(".idea").removeClass("best mostInspiring mostSurprising mostUtile")
    }


    function gatherInfo() {
		var namedElement =  $("*[name]:checked, *[name]:not([type=radio])") 
		var questionnaire = JSON.parse( localStorage["questionnaire"] || "{}" ) 
		for( var i = 0 ; i < namedElement.length ; i++ ) {
		    questionnaire[namedElement[i].name] = namedElement[i].value  
		    localStorage["questionnaire_" + namedElement[i].name ] = namedElement[i].value ; 
		}
		localStorage["questionnaire"] =  JSON.stringify( questionnaire ) ; 
    }


    function createPrepareSelect( className, callback ) {
		var select = function  ( e ) {
		    switch( e.which ) {
		    case 1 :
			$(e.target).toggleClass(""+className+"") ;

			var title = $("#select"+className+"IdeasMessage h1").data("title") ;
			$("#select"+className+"IdeasMessage h1").text(title + " " + $("."+className+"").length +"/5")

			if( $("."+className+"").length == 5 ) {
			   // $("#"+className+"Ideas").before("Ranger les idées dans l'ordre décroissant d'intérêt (1. meilleur idée, ...) ")
			    $("#"+className+"Ideas").append( $("."+className+"").clone().removeClass(""+className+"")  ) ;
			    $("#"+className+"Ideas p").wrap("<li></li>")
			    $("#"+className+"Ideas").sortable() ; 
			    console.log("#select"+className+"Start");
			    $("#select"+className+"IdeasStart").remove() ; 
			    $("#"+className+"Ideas").after( "<button id='"+className+"OrderedIdeas'> suite </button>")
			    $("#select"+className+"IdeasMessage").addClass("active") ;
			    $("#select"+className+"IdeasMessage").removeClass("inactive") ;
			    
			    $("#"+className+"OrderedIdeas").click( 
				function() {
				    var results = $("#"+className+"Ideas li p") ;
				    var resultArray = [] ; 
				    for( var i = 0 ; i <  results.length ; i++  ) {
					console.log( i + " " + results[i] ) ; 
					if(  $(results[i]) != undefined ) 
					    resultArray.push(   $(results[i]).data().id )
				    }
				    localStorage["result_"+className] = resultArray ; 
				    callback() ; 
				}
			    ) ; 
			}
			break ; 
		    }
		}
		return function () {
		    clean() ; 
		    $("#select"+className+"IdeasMessage").show() ; 

		    $("#select"+className+"IdeasMessage h1").click( function () {
			$("#select"+className+"IdeasMessage").toggleClass( "active inactive" ) 
		    })
		    $("#select"+className+"IdeasStart").click( function () {
			$("."+className+"").removeClass(""+className+"") ;
			$("#"+className+"Ideas").empty() ; 
			$("#select"+className+"IdeasMessage").toggleClass("active inactive")
			$(".idea").click( select ) ; 
		    }) 
		}
    }
    


//surpris 
//inspiring 


    function backToIndex () {
	window.location = window.location.origin + "/accueil.html" ; 
    }


    function MetaData (metadata) {
	this.color = "red"        ;
	this.timestamp = (new Date()).getTime()       ; 
	this.authors = "Anonymous" ; 
	for( var i in metadata )  {
	    this[i] = metadata[i] ;
	}
    }
    function Node (content, metaData) {
	this.metaData = new MetaData (metaData) ; 
	this.content  = content ;
	this.id       =  uuid(this.metaData.authors ) ; 
    }
    {

	var uuid_i = 0 ; 
	function uuid (str) {
	    var a = 0 ; 
	    for (var i in str) {
		a*= 181 ; 
		a += str.charCodeAt(i) ; 
		a = (a%104729) 
	    }
	    return (a%104729) +"." + (uuid_i++)*( (new Date()).getTime() %104729)  ;
	}

    }


    var otherIdea = $( "#otherIdeas" ) 
    , container = otherIdea.parent() ;
    
    var onResize = function() {
	otherIdea.css( "height" , (container.css("height").slice(0,-2) * 5) + "px" ) 

    }
    
    $( window ).resize( onResize ) 
    
    onResize() ; 
    setInterval(function() {limitMessageDisplay(120)},5000);

    hostname = window.location.hostname ; 
    user = localStorage.name ; 
    var client = new clientBrainstorming( location.hostname+":8800") 
    
    client.onActiveBrainstormingHandler = function( data ) {
	console.log("log")
	if (localStorage["sandbox"] == "true")  
	    client.joinBrainstorming( "sandbox_" + localStorage.groupeId +".txt") ; 
	else 
	    client.joinBrainstorming( "groupe_" + localStorage.groupeId +".txt") ; 
	
	return true ; 
    }
    client.onNodesHandler = function ( data ) {
	for( var i in data ) {
	    progressBar.parent().append( "<span class='mark' style='left:"+ ~~( ( deltaX/deltaT * (data[i].metaData.timestamp -initT)  )/1000) +"'></span>" ) 
	    otherIdea.append( "<p class='idea "
			      +((data[i].metaData.authors == "Brain:Dennis")?"Brain ":"") 
			      +((data[i].metaData.authors == user)?"Self":"") 
			      +"'"
			      + "data-id='" + data[i].id + "' "
			      + "data-author='" + data[i].metaData.authors + "' "
			      +">" + data[i].content + "</p>" ) ;

	    limitMessageDisplay(120) ;
	}

    }
    function limitMessageDisplay( maxMessage ) {
    	console.log("limit to " + maxMessage)
    	if($( "#otherIdeas" ).children().length > 120)  $(".idea:first").hide(5000, function () { 
	    	$(".idea:first").remove() ; 
	    } )
    }
    function revealDennis() {
		$("head").append("<style>\
			.brain {\
			color: hsl(0, 100%, 30%);\
			font-style: italic;\
			}\
			.brain:before {\
			content:'Suggestion : '\
			}\
			</style>"
		)

    }

    client.onTitleHandler = function ( data ) {
		$("#title").text( data.title ) ; 
		$("*[name=probleme]").text(data.title)
console.log( "titleHandler")
console.log( data)
		initT = data.initT ; 
		deltaT = data.deltaT || 900  ; 
		deltaX = 900 ; 
		localStorage.type = data.type ; 
		localStorage.startTime = (new Date()).getTime()  ;
		otherIdea.empty() ; 
		if( data.type == "Brain:DennisVisible"  ) {
		    revealDennis() ; 
		}
    }
    progressBar.css( {width : Math.min( deltaX, ~~(0/deltaT *deltaX) ) + "px" } ) ;


    client.connect() ; 
    setTimeout( function () {
	console.log( "user registration " + client.name )
	localStorage.id = uuid(user).split(".")[0] ;
	

	console.log ( "send" )
	usersRegistrationData = {
	    name : client.name 
	    , username : user  
	    , info : localStorage
	    , timestamp : (new Date()).getTime() 
    }
	console.info( usersRegistrationData)
	client.usersRegistration( usersRegistrationData  ) 

	}, 1000 )


    var sendProposition = function() {

	
	var t = (new Date()).getTime() ;

	var content = $("#proposition").val() ;
	
	client.sendNode( 	    
	    new Node( content , {authors:user} ) 
	)
	progressBar.parent().append( "<span class='mark' style='left:"+ ~~( ( t -initT ) / 1000) +"'></span>" ) 
	otherIdea.append( "<p class='idea "
			      + "Self"
			      +"'>" + content + "</p>" ) ;

	$("#proposition").val("") ;
	
	
    }
    $("#send").click( sendProposition )
    $("#proposition").keyup(
	function( event ) {
	    if( !event.shiftKey   && event.keyCode == 13 )
		sendProposition() ;
	    event.stopPropagation() ; 
	    return false ; 
	}
    )
    //Progress Bar 




	    $("#questionnaireEnd").before(  createLikert("quantitySelf", 7, ["faible", "importante"]
							     , "Quantité d’idée produites"
							     , "Comment évaluez-vous le nombre d’idées que vous avez produit : ") )
	    $("#questionnaireEnd").before(  createLikert("quantityOther", 7, ["faible", "importante"]
							     , null 
							     , "Comment évaluez-vous le nombre d’idées que le reste du groupe a produit :"))  

//--------------------

	    $("#questionnaireEnd").before(  createLikert("utilitySelf", 7, ["faible", "importante"]
							     , "Utilité des idées produites"
							     , "Comment évaluez-vous l'utilité des idées que vous avez produites : ") )
	    $("#questionnaireEnd").before(  createLikert("utilityOther", 7, ["faible", "importante"]
							     , null 
							     , "Comment évaluez-vous l’utilité des idées que le reste du groupe a produites :"))  




//--------------------
	    $("#questionnaireEnd2").before(  createLikert("originalitySelf", 7, ["faible", "importante"]
							     , "Originalité d’idée produites"
							     , "Comment évaluez-vous l’originalité des idées que vous avez produites : ") )
	    $("#questionnaireEnd2").before(  createLikert("originalityOther", 7, ["faible", "importante"]
							     , null 
							  , "Comment évaluez-vous l’originalité des idées que le reste du groupe a produites : "))  
//--------------------
	    $("#questionnaireEnd2").before(  createLikert("InspirationSelf", 7, ["pas du tout", "beaucoup"]
							     , "Inspiration"
							     , "Avez-vous été inspiré par les idées des autres ?"))
	    $("#questionnaireEnd2").before(  createLikert("inspirationOther", 7, ["pas du tout", "beaucoup"]
							     , null 
							     , "Pensez vous que les autres participants ont été inspiré par vos idées"))







//--------------------------------------------------------------------------------

	    $("#questionnaireEnd3").before(  createLikert("quantityDennis", 7, ["faible", "importante"]
							     , "Quantité d’idée produites"
							     , "Comment évaluez-vous le nombre d’idées que l'agent a produit : ") )
//--------------------

	    $("#questionnaireEnd3").before(  createLikert("utilityDennis", 7, ["faible", "importante"]
							     , "Utilité des idées produites"
							     , "Comment évaluez-vous l'utilité des idées que l'agent a produites : ") )
	   
//--------------------
	    $("#questionnaireEnd3").before(  createLikert("originalityDennis", 7, ["faible", "importante"]
							     , "Originalité d’idée produites"
							     , "Comment évaluez-vous l’originalité des idées que l'agent a produites : ") )
	   
//--------------------
	    $("#questionnaireEnd3").before(  createLikert("InspirationDennis", 7, ["pas du tout", "beaucoup"]
							     , "Inspiration"
							     , "Avez-vous été inspiré par les idées de l'agent ?"))


}) ;
function createLikert ( name, nbValue, labels, title, tagline ) {

    var p = document.createElement( "form" ) ; 

    if( title ) { 
	h2 = document.createElement( "h2" ) ; 
	h2.innerText = title
	p.appendChild( h2 ) ; 
    }

    if( tagline ) {
	span = document.createElement( "span" ) ; 
	span.innerText = tagline
	p.appendChild( span ) 
    }

    var ul = document.createElement( "ul" )
    ul.setAttribute("class", "likert") ;
    for( var i = 0 ; i < nbValue ; i++) {
	var li = document.createElement( "li" )
	if( i == 0 | i == nbValue - 1 ) {
	    var label = document.createElement( "label" ) ;
	    label.setAttribute( "for", name + ( (i)? "last" : "first" ) )
	    label.innerText =  ( (i)? labels[1] : labels[0] )  ;

	}
	var input = document.createElement( "input" )
	input.setAttribute( "type", "radio" )
	input.setAttribute( "name", name )
	if( i == 0 | i == nbValue - 1 ) 
	    input.setAttribute( "id" ,  name + ( (i)? "last" : "first" ) )
	input.setAttribute( "value", i+1 )

	if( !i) li.appendChild( label )
	li.appendChild( input ) ; 
	if( i == nbValue -1 ) li.appendChild( label )
	ul.appendChild( li )
    }

    p.appendChild( ul ) ; 

    return p ; 
}
