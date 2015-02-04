var manager = require( "./nodeManager" ) ;
var ants = require("./ants") ; 
var Node = require("./node.js") ; 
var Bond = require("./bond.js") ; 
var fs   = require("fs") ;
require("./ArrayUtilities.js") ; 
var ClientBrainstorming = require("./clientbrainstorming.js")


var cachedTranslations = {} ; 
function loadCachedTranslation() {
    fs.readFile("res/cachedTranslations.json", function(err, data) {
	if( err ) {
	    console.log( "Could not read cached translations : " )
	    return ; 
	}
	cachedTranslations = JSON.parse( data ) ; 
    }) ;
}
function saveCachedTranslation() {
    fs.writeFile( "res/cachedTranslations.json", JSON.stringify( cachedTranslations ), function( err ) {
	if( err ) console.log( "Could not write translations to cache" ) ; 
    });
}


function initRelationship () {
    // manager.relationalWorkspace.push( new Node  ( "WORD" , 0 , 1 , [] )); 
    // manager.relationalWorkspace.push ( new Node ( "NOUN" , 0 , 1, [] )) ;
    // manager.relationalWorkspace.push ( new Node ( "VERB" , 0 , 1, [] )) ;
    // manager.relationalWorkspace.push ( new Node ( "ADVERB" , 0 , 1, [] )) ;
    // manager.relationalWorkspace.push ( new Node ( "ADJECTIVE" , 1 , 0, [] )) ;
    // manager.relationalWorkspace.push ( new Node ( "SENTENCE" , 0 , 1, [] )) ;

    // manager.relationalWorkspace.push ( new Node ("ANTONYM" , 0 , 1, [] ),"!") ;
    // manager.relationalWorkspace.push ( new Node ("HYPERNYM" , 0 , 1, [] ),"@") ;
    // manager.relationalWorkspace.push ( new Node ("INSTANCE_HYPERNYM" , 0 , 1, [] ),"@i") ;
    // manager.relationalWorkspace.push ( new Node ("HYPONYM" , 0, 1, [] ),"~") ;
    // manager.relationalWorkspace.push ( new Node ("INSTANCE_HYPONYM" , 0, 1, [] ),"~i") ;
    // manager.relationalWorkspace.push ( new Node ("MEMBER_HOLONYM" , 0, 1, [] ),"#m") ;
    // manager.relationalWorkspace.push ( new Node ("SUBSTANCE_HOLONYM" , 0, 1, [] ),"#s") ;
    // manager.relationalWorkspace.push ( new Node ("PART_HOLONYM" , 0, 1, [] ),"#p") ;
    // manager.relationalWorkspace.push ( new Node ("MEMBER_MERONYM" , 0, 1, [] ),"%m") ;
    // manager.relationalWorkspace.push ( new Node ("SUBSTANCE_MERONYM" , 0, 1, [] ),"%s") ;
    // manager.relationalWorkspace.push ( new Node ("PART_MERONYM" , 0, 1, [] ),"%p") ;
    // manager.relationalWorkspace.push ( new Node ("ATTRIBUTE" , 0, 1, [] ),"=") ;
    // manager.relationalWorkspace.push ( new Node ("DERIVATIONALLY_RELATED_FORM" , 0, 1, [] ),"+") ;
    // manager.relationalWorkspace.push ( new Node ("DOMAIN_OF_SYNSET_TOPIC" , 0, 1, [] ),";c") ;
    // manager.relationalWorkspace.push ( new Node ("MEMBER_OF_MANAGER_DOMAIN_TOPIC" , 0, 1, [] ),"-c") ;
    // manager.relationalWorkspace.push ( new Node ("DOMAIN_OF_SYNSET_REGION" , 0, 1, [] ),";r") ;
    // manager.relationalWorkspace.push ( new Node ("MEMBER_OF_MANAGER_DOMAIN_REGION" , 0, 1, [] ),"-r") ;
    // manager.relationalWorkspace.push ( new Node ("DOMAIN_OF_SYNSET_USAGE" , 0, 1, [] ),";u") ;
    // manager.relationalWorkspace.push ( new Node ("MEMBER_OF_MANAGER_DOMAIN_USAGE" , 0, 1, [] ),"-u") ;
    
    // manager.relationalWorkspace.push ( new Node ("ENTAILMENT" , 0, 1, [] ),"*") ;
    // manager.relationalWorkspace.push ( new Node ("CAUSE" , 0, 1, [] ),">") ;
    // manager.relationalWorkspace.push ( new Node ("ALSO_SEE" , 0, 1, [] ),"^") ;
    // manager.relationalWorkspace.push ( new Node ("VERB_GROUP" , 0, 1, [] ),"$") ;

    // manager.relationalWorkspace.push ( new Node ("SIMILAR_TO" , 0, 1, [] ),"&") ;
    // manager.relationalWorkspace.push ( new Node ("PARTICIPLE_OF_VERB" , 0, 1, [] ),"<") ;
    // manager.relationalWorkspace.push ( new Node ("PERTAINYM" , 0, 1, [] ),"\\") ;
    // manager.relationalWorkspace.push ( new Node ("DERIVED_FROM_ADJ" , 0, 1, [] ),"\\") ;

    manager.dictionnary.push( new Node( "Entity", 0, 0.5, {type:"Root"})) ;

    manager.dictionnary.push( new Node( "Sentence", 0, 0.5, {type:"Entity"})) ; 

    manager.dictionnary.push( new Node( "Word", 0, 0.5, {type:"Entity"})) ; 
    manager.dictionnary.push( new Node( "Noun", 0, 0.5, {type:"Entity"})) ; 
    manager.dictionnary.push( new Node( "Verb", 0, 0.5, {type:"Entity"})) ; 
    manager.dictionnary.push( new Node( "Adjective", 0, 0.5, {type:"Entity"})) ; 
    manager.dictionnary.push( new Node( "Adverb", 0, 0.5, {type:"Entity"})) ; 

    manager.dictionnary.push( new Node( "Relation", 0, 0.5, {type:"Relation"})) ; 
    manager.dictionnary.push( new Node( "Hypernym", 0, 0.5, {type:"Relation"})) ; 
    manager.dictionnary.push( new Node( "Antonym", 0, 0.5, {type:"Relation"})) ; 
    manager.dictionnary.push( new Node( "Synonym", 0, 0.5, {type:"Relation"})) ;
    manager.dictionnary.push( new Node( "Lemma", 0, 0.5, {type:"Relation"})) ; 
    manager.dictionnary.push( new Node( "Synset", 0, 0.5, {type:"Relation"})) ; 

    manager.dictionnary.push( new Node( "Person",  0, 0.5, {type:"Person"})) ;
    manager.dictionnary.push( new Node( "Author",  0, 0.5, {type:"Person"})) ;
    manager.dictionnary.push( new Node( "Bob",  0, 0.5, {type:"Person"})) ;

    manager.links.push( new Bond("Entity", "Word", "Hypernym")) ;
    manager.links.push( new Bond("Word", "Noun", "Hypernym")) ;
    manager.links.push( new Bond("Word", "Verb", "Hypernym")) ;
    manager.links.push( new Bond("Word", "Adjective", "Hypernym")) ;
    manager.links.push( new Bond("Word", "Adverb", "Hypernym")) ;
    manager.links.push( new Bond("Word", "Relation", "Hypernym")) ;
    manager.links.push( new Bond("Relation", "Hypernym", "Hypernym")) ;
    manager.links.push( new Bond("Relation", "Antonym", "Hypernym")) ;
    manager.links.push( new Bond("Relation", "Synonym", "Hypernym")) ;			     
    manager.links.push( new Bond("Relation", "Lemma", "Hypernym")) ;			     
    manager.links.push( new Bond("Relation", "Synset", "Hypernym")) ;			     

    manager.links.push( new Bond("Lemma", "Synset", "Antonym")) ;			     
    manager.links.push( new Bond("Antonym", "Synonym", "Antonym")) ;


    manager.links.push( new Bond("Entity", "Person", "Hypernym")) ;
    manager.links.push( new Bond("Person", "Author", "Hypernym")) ;
    manager.links.push( new Bond("Author", "Bob", "Hypernym")) ;

    


}


var clog = console.log ; 

function init () {
    loadCachedTranslation() ; 
    initRelationship() ; 
    manager.codeRack.push ( new ants.scouts["newSentenceScout"] () 
			    , function () { return 1 } ); 
    manager.initialTemp =  temperature() ; 
    manager.decay = 0.05 ; 

    manager.client = new ClientBrainstorming( "127.0.0.1:8888" ) ;
    manager.res=[]
    manager.client.onNodesHandler = function ( data ) {

	function handleTranslatedText(res) {
	    var manager=this.manager  
	    , data = this.data ; 
	    data.translatedRes =  res.data.translations[0].translatedText  ; 
	    manager.sentences.push( data ) ; 
	}
	for( var i in data ) {
	    translate( "fr"
		       , "en"
		       , data[i].content
		       , handleTranslatedText.bind({manager: manager, data : data[i] })
		     );
	}
	return false ; 
    }
    
    manager.client.connect() ; 

    
}
function main () {
//    for ( var i = 0 ; i < 2 ; i++ ) {
    setInterval ( beat, 5000 ) ; 
}

exports.intervalRef = 0 ;
exports.interval = 5000 ; 
function start ( optionnalInterval ) {
    exports.intervalRef = setInterval( beat, optionnalInterval || exports.interval ) ; 
}
function stop ( ) {
    clearInterval( exports.intervalRef ) ; 
}

var printScout = new ants.scouts.printScout () ;

// Object.defineProperties ( manager.codeRack
// 			  , {inspect : { 
// 			      enumerable:false
// 			      , configurable:true
// 			      , value:function() {
// 				  var str="";  
// 				  for( var i in this.data ) { 
// 				      ant=this.data[i] ;  
				      
// 				      str+= ant.name + "\t\t" + ant.urgency(global.manager)
// 				  }
// 				  return str ; 
// 			      }}});

function beat () {
    //Print the state of the manager
    //manager.print( 0 ) ; 
    //get the next ant
    var antsPriority = {}
    , offset = 0
    , r = 0
    , theNextAnt = printScout ;
    console.log("**************************************************");

    var bias = [] ;
    for( var i in manager.codeRack.data ) {
	var ant = manager.codeRack.data[i] ;
	bias.push( ant.urgency( manager ) ) ;
    }
    var j = randomElementBiased2( manager.codeRack.data, bias ) ; 



    theNextAnt = manager.codeRack.data[j] || printScout ; 

    manager.codeRack.remove( theNextAnt ) ;   

    clog ("=============="+ theNextAnt.name || "nameless ant" ) ; 
    theNextAnt.crawl( manager ) ;  
    manager.propagateActivation () ; 


    //console.log(brain.manager.workspace.nodes) ; 
    //console.log(brain.manager.codeRack.inspect2())
    var t = temperature() ; 
    manager.decay = 0.2 * t / manager.initialTemp ; 
}

function temperature() {
    var sum = 0 ; 
    for( var i in manager.dictionnary.keys ) {
	var n = manager.dictionnary.get( i, true ) ; 
	sum += n.activation ; 
	    
    }

    console.log( "activation is " + sum ) ;
    return sum ;
}
exports.init = init ; 
exports.main = main ; 
exports.beat = beat ; 
exports.manager = manager ;
exports.start = start ; 
exports.stop = stop ; 






//Translation Modules 
function translate (from, to, text, callback) {
    var url = "https://www.googleapis.com/language/translate/v2"
    , key = "AIzaSyCObCj2VT_4K1-Q-yyuuh1ORzn6eJbGUvo" ;



    if( cachedTranslations[ text ] ) { 
	callback( cachedTranslations[ text ] )  ; 
	return ; 
    }

    var aux_callback = function( data ) {
	cachedTranslations[ text ] = data ; 
	saveCachedTranslation() ; 
	callback( data ) ; 	
    }
    url=addParam(url, 
		 {key:key
		  , source:from
		  , target:to
		  , callback:"aux_callback"
		  , q: text}) ;

//    callback({data : {translations : [{translatedText:"when the cat sleeps, the mice play!"}]}}) ; return ; 



    https.get(url
	     , function (response) {
		 var str = "" ; 

		 response.on('data', function (chunk) {
		     str += chunk;
		 });
		 //the whole response has been recieved, so we just print it out here
		 response.on('end', function () {
		     eval(str) ;
		 });		
	     })
	.on('error', function(e) {console.log("Got error: " + e.message); });
}


function addParam ( url, param ) {
    var reponseUrl = url + "?" ;
    for ( var i in param ) {
	reponseUrl += i + "=" + param[i] + "&" ;
    }
    return reponseUrl.slice(0,-1) ; 
}
//-------------


function randomElementBiased2( elements, bias ) {
    var sum = 0
    , r = Math.random()
    , result = 0 ; 

    for( var i in bias ) {
	sum += bias[i] ; 
    }
    r *= sum ; 
    sum = 0 ; 
    for( var i in elements ) {
	sum+= bias[i] ; 
	result = i ;
	if( r < sum ) { 
	    break ; 
	}
    }
    console.log("REB : "+result+"/"+ elements.length)
    return result ; 
}
