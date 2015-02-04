var ClientBrainstorming = require( "../../server/clientInterface.js" ) 
, natural = require( "natural" ) 
, pos = require('pos') 
, wordnet =  new natural.WordNet() 
, lexer   = new pos.Lexer() 
, tagger = new pos.Tagger()
, singularizer = new natural.NounInflector() 
, https = require( "https" )
, fs = require("fs")
, colors = require("colors")
, util = require("util") 
, opt = require('node-getopt').create([
      ['h', 'help'    , 'display this help and exit']
    , ['V', 'version' , 'show version and exit']
    , ['v', 'verbose' , 'print debug information']
    , ['p', 'port=PORT_NUMBER'    , 'Brainstorming port']
    , ['s', 'session=SESSION_NAME'    , 'Name of the session to join']
    
])              // create Getopt instance
    .bindHelp()     // bind option 'help' to default action
    .on("version", function() { //Bind version to expected behavior
	console.log( "NodeManager_"+version+", Sept 25th 2013" ) ; 
	process.exit(0) })
    .parseSystem(); // parse command line

var ajouterChanged = 0 ; 
var ajouterACeTour = [] ;
console.log( "*******" + opt.options.session ) 

var cachedTranslations = {} ; 

var sentences = []
, taggedWords = []
, participants = {}
, nouns = []
, verbs = []
, adjectives = []
, adverbs = []
, dennisWits = [] 
;



//recupere les valeurs uniques dans un tableau

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}




var convert = {} ; 
convert["CC"] = {pos : "o", type : "Coord Conjuncn" }
convert["CD"] = {pos : "n", type : "Cardinal number" } 
convert["DT"] = { pos : "o", type : "Determiner" }
convert["EX"] = { pos : "o", type : "Existential there " }
convert["FW"] = { pos : "o", type : "Foreign Word " }
convert["IN"] = { pos : "o", type : "Preposiion " }
convert["JJ"] = { pos : "a", type : "Adjective " }
convert["JJR"] = { pos : "a", type : "Adj., comparative " }
convert["JJS"] = { pos : "a", type : "Adj., superlative " }
convert["LS"] = { pos : "o", type : "List iem marker " }
convert["MD"] = { pos : "o", type : "Modal  " }
convert["NN"] = { pos : "n", type : " Noun, sing. or mass " }
convert["NNP"] = { pos : "o", type : "Proper noun, sing. " }
convert["NNPS"] = { pos : "o", type : "Proper noun, plural  " }
convert["NNS"] = { pos : "n", type : "Noun, plural " }
convert["POS"] = { pos : "o", type : "Possessive ending " }
convert["PDT"] = { pos : "o", type : "Predeterminer " }
convert["PP$"] = { pos : "o", type : "Possessive pronoun " }
convert["PRP"] = { pos : "o", type : " Personal pronoun " }
convert["RB"]  = { pos : "r", type : "Adverb " }
convert["RBR"] = { pos : "r", type : "Adverb, comparative " }
convert["RBS"] = { pos : "r", type : "Adverb, superlative fas" }
convert["RP"]  = { pos : "o", type : "Particle " }
convert["SYM"] = { pos : "o", type : " Symbol " }
convert["TO"] = { pos : "o", type : "ÒtoÓ " }
convert["UH"] = { pos : "o", type : "Interjecion " }
convert["URL"] = { pos : "o", type : "url h" }
convert["VB"] = { pos : "v", type : "verb, base form " }
convert["VBD"] = { pos : "v", type : "verb, past tense " }
convert["VBG"] = { pos : "v", type : "verb, gerund " }
convert["VBN"] = { pos : "v", type : "verb, past part " }
convert["VBP"] = { pos : "v", type : "Verb, present " }
convert["VBZ"] = { pos : "v", type : "Verb, present " }
convert["WDT"] = { pos : "o", type : "Wh-determiner which," }
convert["WP"]  = { pos : "o", type : "Wh pronoun " }
convert["WP$"] = { pos : "o", type : "Possessive-Wh " }
convert["WRB"] = { pos : "o", type : "Wh-adverb " }


var structurePhrases = [
    "a strong bull eat"
    , "the strong bulls eat"
    , "a bull that can eat something"
    , "the bulls that can eat something"
    , "a bull eating strongly"
    , "the bulls who are eating strongly" 
    , "something as strong as a bull" 
    , "something as strong as bulls"
    , "a bull with an apple"
    , "something with an apple"
	, "an apple with something"
    , "bulls with an apple"
    , "a bull with apples"
    , "bulls with apples" 
    , "sing strongly"
]
structureLexedWords = [] 
structureTaggedWords = [] 
for( var i = 0, s ; s = structurePhrases[i] ; i++ ) {
    structureLexedWords[i] = lexer.lex( s ) ; 
    structureTaggedWords[i] = tagger.tag( structureLexedWords[i] ) ; 
    for (var j in  structureTaggedWords[i])
    if( structureTaggedWords[i][j][0] == "something" ) structureTaggedWords[i][j][1] = "DT"

}


console.log ( util.inspect( structureLexedWords ) ) ;
console.log ( util.inspect( structureTaggedWords  ) ) ;


var uuid_i = 1 ; 
function uuid (str) {
    var a = 0 ; 
    for (var i in str) {
	a*= 181 ; 
	a += str.charCodeAt(i) ; 
    }
    return (a%104729) +"." + (uuid_i++)*( (new Date()).getTime() %104729)  ;
}

dennisWords = {
    n : ["knife"]
    , v : ["cut"] 
    , a : ["sharp"]
    , r : ["quickly"] 
    , s : [] 
    , count : 30 
    , offsets : {}
}

dennisWordsLearned = {
    n : []
    , v : [] 
    , a : []
    , r : [] 
    , s : [] 
}


dennisWords.n = JSON.parse(  fs.readFileSync( __dirname + "/words/nouns.json", {encoding : "utf-8"} ) ) 
dennisWords.a = JSON.parse(  fs.readFileSync( __dirname + "/words/adjectives.json", {encoding : "utf-8"} ) ) 
dennisWords.r = JSON.parse(  fs.readFileSync( __dirname + "/words/adverbs.json", {encoding : "utf-8"} ) ) 
dennisWords.v = JSON.parse(  fs.readFileSync( __dirname + "/words/verbs.json", {encoding : "utf-8"} ) ) 


var lastWords = undefined ; // fs.readFileSync( __dirname + "/" + opt.options.session  ) ;

if( lastWords ) {
    dennisWordsLearned = JSON.parse( lastWords ) ; 
    for ( var i in dennisWordsLearned ) {
	for( var j in dennisWordsLearned[i] ) {
	    dennisWords[i].push( dennisWordsLearned[i][j] ) ; 
	}
    }
}

//console.log( dennisWords ) 
maxDepth = 16 ; 
minDepth = 1 ; 

setInterval( function() {
    fs.writeFile( __dirname + "/" + opt.options.session , JSON.stringify( dennisWordsLearned )  )
}, 10000 ) ; 



function getRandom( arr ) {
    return arr[ ~~(arr.length * Math.random() )] ;
}

var client = new ClientBrainstorming( "127.0.0.1:" + opt.options.port ) ;
    client.onNodesHandler = function ( data ) {
//	console.log( data ) ; 
	function handleTranslatedText(res) {
	    data = this.data ; 
	    data.translatedRes = decodeURI( res.data.translations[0].translatedText ) ; 

	    console.log( ("translated text : " + data.translatedRes).red ) ; 

	    data.words = lexer.lex( data.translatedRes ) ; 
	    data.taggedWords = tagger.tag( data.words ) ; 

//	    console.log( data.translatedRes ) ; 
	    if( data.metaData.authors == "Brain:Dennis" )  {
		dennisWits.push( data ) ; 
		return ; 
	    }
	    sentences.push( data ) ; 
	    taggedWords.concat( data.taggedWords )  ; 
	    for( var i in data.taggedWords ) {
		if( tag2pos( data.taggedWords[i][1] ) != "o") {
		    var word = data.taggedWords[i][0] ; 
		    dennisWords.count += 30 ; 
		    enrichDennisWords( dennisWords, word ) ;
		}
	    }


	  


	}
	for( var i in data ) {
//	    console.log( i + " " + util.inspect( data[i] ) ) ; 
		console.log( data[i].content.green )
	    if( data[i] == undefined ) continue 
	    translate( "fr"
		       , "en"
		       , data[i].content
		       , handleTranslatedText.bind({data : data[i] })
		     );
	}
	return false ; 
    }
    
client.connect() ; 
client.onActiveBrainstormingHandler= function (data) {
    for( var i in data ) {
	console.log( data[i] )
    }
    console.log( "join " + opt.options.session ) 
    client.joinBrainstorming(   opt.options.session )
    return true ; 
}

function think () {


	if( ajouterChanged ) setTimeout( function () {
		if( ajouterChanged ) 
		console.log( ajouterACeTour.sort().filter( onlyUnique )  ) ;
		ajouterChanged = 0 
	}, 1000 )

	if( sentences.length / 2  > dennisWits.length + 1 ) {
	    //Dennis choose two random sentences, one for the structure on for the content
	    var sentenceStructure = getRandom(structureTaggedWords)  ; 
	    var sentenceOut = getRandom( sentences ) ; 
	    console.log( sentenceStructure ) ;
	    var words = []  ; 
	    //scrambled eggs
	    for( var i in sentenceStructure ) {
		var pos = tag2pos( sentenceStructure[i][1] ) ; 
		switch( pos ) {
		case "a" : 
		case "v" : 
		case "n" : 		
		case "r" : 
		    words[i] =  getRandom( dennisWords[ pos ] ) 
		    break ;
		default : 
		    words[i] = sentenceStructure[i][0]
		}	    
		if( sentenceStructure[i][1] == "NNS" ) {
		    words[i] = singularizer.pluralize( words[i] ) ;
		}
		if( sentenceStructure[i][1] == "VBG" ) {
		    words[i] = natural.PorterStemmer.stem( words[i] ) + "ing"  ;
		}
	    }

	    console.log ( words.join(" ").blue )
	    isItGood( words.join(" "), 
		      function (detections) {
			  for( var i in detections[0] ) 
			  { var detection = detections[0][i] ;
			    if(  detection.language ==  'en' &&  detection.confidence> 0.6 ) {
	            dennisWits.push( words  ) 
				var s = {} ; 
				for( var i in sentenceOut ) {
				    s[i] = sentenceOut[i] ; 
				}
				s.words = words
				console.log("confidence :" + detection.confidence)
				send( s ) ;
				return 
			    }
			  }
		      } ) ;
	}
    }

setTimeout( function () {  setInterval( think , 2000 ) ; } , 5000)
//think() ; 
setTimeout( function () {
    client.usersRegistration( {
	name : opt.options.session
	, username : "Brain:Dennis"
	, info : {id : uuid( "Dennis" ).split(".")[0] }
	, timestamp : (new Date()).getTime() 
    } ) }, 2000 )



/**/
//Translation Modules 

function isItGood (text, callback) {
    var url = "https://www.googleapis.com/language/translate/v2/detect"
    , key = "AIzaSyCObCj2VT_4K1-Q-yyuuh1ORzn6eJbGUvo" ;

    var aux_callback = function( data ) {
	callback( data.data.detections) ; 	
    }
    
    url=addParam(url, 
		 {key:key
		  , callback:"aux_callback"
		  , q: text}) ;

    try {
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

	} catch( error ) {
		console.error( "something bad happened" + error )
	}
}

function translate(from, to, text, callback) {
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
//    callback({data : {translations : [{translatedText:text}]}}) ; return ; 
    
	try{	
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

	} catch( error ) {
		console.error( "something bad happened" + error )
	}
}


function addParam ( url, param ) {
    var reponseUrl = url + "?" ;
    for ( var i in param ) {
	reponseUrl += i + "=" + param[i] + "&" ;
    }
    return reponseUrl.slice(0,-1) ; 
}








//


function tag2pos ( tag ) {
    if (!convert[tag]) {
	console.log("unfound tag : " + tag)
	return "o" 
    }
    return convert[tag].pos ; 
}




function loadCachedTranslation() {

    fs.readFile(__dirname + "/res/cachedTranslations.json", function(err, data) {
	if( err ) {
	    console.log(__dirname) ;
	    console.log( "Could not read cached translations : " + err
 )
	    return ; 
	}
	cachedTranslations = JSON.parse( data ) ; 
    }) ;
}
function saveCachedTranslation() {
    fs.writeFile( __dirname +  "/res/cachedTranslations.json", JSON.stringify( cachedTranslations ), function( err ) {
	if( err ) {
	    console.log(__dirname) ;
	    console.log( "Could not write translations to cache " + err ) ; 
	}
    });
}

 
function enrichDennisWords(dennisWords, seed) {

//ajouterACeTour = [] ;
    function aux( synset ) {


	 var offset = "" 
	 for ( var i = this.depth ; i < maxDepth ; i++ ) offset += "   " ;

	// console.log( offset + util.inspect( synset.lemma ) 
	// 	     + "\n" + offset  
	// 	     +  util.inspect( this ) 
	// 	     + "\n" + offset  
	// 	     + util.inspect( dennisWords.count ) 
	// 	   )

	//Max number of words reached 
	if( dennisWords.count == 0  ) {
//	    console.log( util.inspect(	    dennisWords) ) 


//	    console.log( util.inspect( this.chaine ) ) 
	    return ; 
	}
	//Already visited Synset
	if( this.chaineOffsets.hasOwnProperty( synset.synsetOffset ) ) return ; 
	this.chaineOffsets[synset.synsetOffset] = 1 ; 
	//Erreur N'existe pas 
	if( synset == undefined ) {
	    this.depth = 0 ; 
	    this.count-- ; 
	    this.results ; // untouched

	    console.log( "Error undefined leaf : " + util.inspect( this.chaine ) ) 
	    return this ;
	}

	this.chaine.push(synset.lemma ) ; 
	
	//Profondeur ideale atteinte ou maximale possible
	if( this.depth <= maxDepth - minDepth || synset.ptrs.length == 0 ) {
	    this.depth = 0 ; 
	    this.count -- ; 











	    function ifItIsSimpleEnglish( word, callBack ) {
		isItGood( word, 
			  function (detections) {
			    for( var i in detections[0] ) {

			    var detection = detections[0][i] ;
				if( detection.language ==  'en' &&  detection.confidence> 0.6 ) {		   
					translate("en", "fr", word, function(result) { 
					 	if( word == result.data.translations[0].translatedText   ) {
					/*	console.log( word 
					 				+ "is a good word that can be translated to " + result.data.translations[0].translatedText  
					 				+ "with confidence" + detection.confidence) ;*/
					    } else {
					    	callBack( word ) ; 
					    }
				 	}) ; 
				}
		  	}
		}) ;
	    }


	    if( synset.pos=="a" && ( synset.lemma.replace(/_/g, " ").split(" ").length == 1)) {
		ifItIsSimpleEnglish(  synset.lemma.replace(/_/g, " ") + "ly" 
				      , function( word ) {

ajouterACeTour.push( word ) ;
ajouterChanged = 1 ;
					for(var i = 0 ; i < 20 ; i ++ )  dennisWords["r"].push( word ) 
					  dennisWordsLearned["r"].push( word ) 
				      })
	    }
	    if (synset.pos=="s") synset.pos="a" ;
	    
	    ifItIsSimpleEnglish(  synset.lemma.replace(/_/g, " ")
				  , function( word ) {
ajouterACeTour.push( word ) ;	
ajouterChanged = 1 ; 			  	
				    for(var i = 0 ; i < 20 ; i ++ )    dennisWords[synset.pos].push( word ) ;
				      dennisWordsLearned[synset.pos].push( word ) ;
				  }) 
	    dennisWords.count -- ; 

	    if( this.depth <= 0 || synset.ptrs.length == 0 ) {
//		console.log( util.inspect(	    dennisWords) ) 
//		console.log( util.inspect( this.chaine ) ) 
		return this ;
	    }
	}

	this.depth-- ; 	
	for( var i in synset.ptrs ) {
	    var ptr = synset.ptrs[i] ;
	   setTimeout( function() { 
	       try {
	       wordnet.get( ptr.synsetOffset, ptr.pos, aux.bind( this )) ; 	   
	       } catch (err) {
		   console.log( "can't get anything done" + err ) 
	       }

	   }.bind(this)  , 100 + 2000*Math.random()) ; 
	}
	
	
    }   

    setTimeout( function() {
    
	wordnet.lookup( seed
		    , function( results ) {
			for( var i in results ) {
			    aux.call({ count : 1 
				       , depth : maxDepth
				       , chaine : []
				       , chaineOffsets : {}
				     }
				     , results[i]
				    ) ;
			}})}
	, + 2000*Math.random()) 



}


// setInterval( function () {

//     console.log( util.inspect( dennisWords ) ) ; 
// } , 5000) ; 
function randomWord( sentence, depth ) {

    var count = sentence.taggedWords.length ; 
    sentence.words = [] ; 


    var aux =  function( results ) {
	this.depth-- ; 

	//Get a random synset 
	var i = 0 
	, synset = results ; 
	if( synset == undefined || synset.ptrs.length == 0  ) {
	    //si pas de pointeurs ou pas synset on prend le mot existant
	    sentence.words[ this.index ] = sentence.taggedWords[ this.index ][0]
		count-- ; 
	    if( count == 0 ) send( sentence ); 
	    return ; 
	}

//	while( synset.pos != sentence.taggedWords[this.index][1] && i < results.length )  synset = results[i++] ; 

	this.chaine.push( synset.lemma ) ; 
	//get a random ptrs
	var ptr = synset.ptrs[  ~~( synset.ptrs.length * Math.random() )] ;

	
	
	if ( this.depth > 0 ) wordnet.get( ptr.synsetOffset, ptr.pos, aux.bind( this )) ; 
	else {
	    console.log ("FINI " + synset.synonyms[0] ) ; 
	    sentence.words[ this.index ] = synset.synonyms[0].replace(/_/g, " ")  ;
	    count-- ; 
	    if( count == 0 ) send( sentence ); 
	}

    }


    for( var i in sentence.taggedWords ) {
	if( sentence.taggedWords[i][1] != "o" ) 
	    wordnet.lookup( sentence.taggedWords[i][0], function( results ) {


		aux.call({ index : this[0]
			   , depth : depth
			   , chaine : []
			   , plural : false  }
			 , results[0]


			) ;
	    }.bind(i)    )
	else count -- ; 
    }

    
}



 
function send( sentence ) {
    console.log( "send "+sentence.words.join(" ")  )
    translate( "en"
	       , "fr"
	       , sentence.words.join(" ") 
	       , function( res  ){ 
	       console.log( "translated to " + res.data.translations[0].translatedText )
		   var translatedText = res.data.translations[0].translatedText.replace("ô","o").replace(/\bles\b/gi, "des") ;
		   id = uuid( "Dennis" ) ; 


		   var node = { metaData: { color: sentence.color, 
					    timestamp: (new Date()).getTime(), 
					    authors: 'Brain:Dennis' },
				content: translatedText ,
				id: id }

		   var link = 
		       { source: sentence.id ,
			 rel: 'next',
			 target: id,
			 metaData: { color: sentence.color
				     , timestamp: (new Date()).getTime()
				     , authors: 'Brain:Dennis' } }
		   setTimeout( 
		       function () {
			   client.sendNode( node ); 
			   client.sendLink( link ) ;
		       }
		       , Math.random() * 10000 + 3000  )
	       } 
	     );
    
    
    

} 


