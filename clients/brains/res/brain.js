var http = require('http'),
pos = require('pos'), 
https = require('https'),
natural = require('natural'),
stemmer = natural.PorterStemmer;
stemmer.attach();
nounInflector = new natural.NounInflector()
nounInflector.attach() ; 
var _wordnet = new natural.WordNet();
var ants = require("./ants") ; 

console.log(ants) ; 


Node = require('./node') ;
Bond = require('./bond') ;







//The Ants crawl the nodes 
function Ant ( antPrototype, dictionnary, relationalWorkspace, workspace ) {
    this.dictionnary = dictionnary ; 
    this.relationalWorkspace = relationalWorkspace ;
    this.workspace = workspace ;
    //prototype surcharge
    for ( var i in antPrototype ) {
	this[i]=antPrototype[i] ;
    }
}
Ant.prototype.crawl = function ( data ) { 
    return data ;
} ;


//Ants prototype 
loggerAnts = {
    crawl: function (data) {
	for ( var node in data.nodes ) {
	    console.log( "crawl : " + data.nodes[node].data) ;
	}
	return data ; 
    }
}



dictionnaryAnts = {
    crawl: function (data) {
	for ( var node in data.nodes ) {
	    var callbackDictionnaryAnts = function callbackDictionnaryAnts ( data ) {
		console.log ( "callbackDictionnaryAnts : " + this.data  )
		for (var i in data.data) {
		    var datum = data.data[i] ;
		    score = datum.words.search( new RegExp( "([^-_]|^)\\b" + this.data + "\\b([^-_]|$)" ))
		    console.log (this.data 
				 + " : " 
				 + datum.lex_filename 
				 + "; " 
				 + datum.words 
				 + "(" 
				 + score
				 + ")" ) ;

		}
	    }
	    wordnet( data.nodes[node].data, callbackDictionnaryAnts.bind( data.nodes[node] ) ) ;
	}
	return data ;

    }


}
//scout ; 
//wordnet Module 
function wordnet ( text, callback ) {
    _wordnet.lookup(text, function(results) {
	results.forEach(function(result) {
	    console.log( "+++++++++++" + result.lemma ) ; 
	    for ( var i in result ) console.log( i + " : " + result[i] ) ; 
	    for (var j in result.ptrs) {
		var a = function (r) { 
		//    console.log(this.lemma + " " +this.pointerSymbol + " " + r.lemma  ) ;
		}
		_wordnet.get(result.ptrs[j].synsetOffset
			     , result.ptrs[j].pos
			     , a.bind({lemma: text
				       , pointerSymbol: result.ptrs[j].pointerSymbol })) ;
	    };
	});
    });
    
}


//Translation Modules 
function translate (from, to, text, callback) {
    var url = "https://www.googleapis.com/language/translate/v2"
    , key = "AIzaSyCObCj2VT_4K1-Q-yyuuh1ORzn6eJbGUvo" ;

    url=addParam(url, 
		 {key:key
		  , source:from
		  , target:to
		  , callback:"callback"
		  , q: text}) ;
    callback({data : {translations : [{translatedText:"when the cat sleeps, the mice play!"}]}}) ; return ; 

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



function addSentence ( manager, sentence ) {
    translate("fr"
	      , "en"
	      , sentence
	      , function ( rep ) { 
		  words = new pos.Lexer().lex(rep.data.translations[0].translatedText) ; 
		  var taggedWords = new pos.Tagger().tag(words);
		  words = cleanWords( taggedWords ) ;
		  for ( var i in words ) {
		      manager.workspace.push( words[i][0], words[i][1] ) ;
		  }
		  manager.coderack.push( new Ants( new ants.scouts.definitionScout() )
					 , urgency.bind( [manager.relationalWorkspace.get( "definition" )] ) 
				       ) 
	      });
}


function cleanWords ( taggedWords ) {
    var cleanedWords = [] ; 
    
    for (i in taggedWords) {
	var taggedWord = taggedWords[i];
	var word = taggedWord[0];
	var tag = taggedWord[1];
	if (tag == "NNS") word = word.singularizeNoun()  ;
	word = word.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"") ;
	if ( word ) cleanedWords.push( [word, tag] ) ; 
    }
    return cleanedWords ;
}




function main () {
    this.relationalWorkspace = new NodeManager () ; 
    this.dictionnary = new NodeManager () ; 
    this.workspace = new NodeManager() ;

    this.ants  = [] ; 

    //init ants
    this.ants.push( new Ant( dictionnaryAnts )) ;
    

    this.relationalWorkspace.push( 
	new Node (
	    "Word"
	    , 0
	    , 0
	    , []
	)); 
 

    this.relationalWorkspace.push ( new Node ( "Noun" , 0 , 0, [] )) ;
    this.relationalWorkspace.push ( new Node ( "Verb" , 0 , 0, [] )) ;
    this.relationalWorkspace.push ( new Node ( "Adverb" , 0 , 0, [] )) ;
    this.relationalWorkspace.push ( new Node ( "Adjective" , 0 , 0, [] )) ;

    this.relationalWorkspace.push ( new Node ("ANTONYM" , 0 , 0, [] ),"!") ;
    this.relationalWorkspace.push ( new Node ("HYPERNYM" , 0 , 0, [] ),"@") ;
    this.relationalWorkspace.push ( new Node ("INSTANCE_HYPERNYM" , 0 , 0, [] ),"@i") ;
    this.relationalWorkspace.push ( new Node ("HYPONYM" , 0 , 0, [] ),"~") ;
    this.relationalWorkspace.push ( new Node ("INSTANCE_HYPONYM" , 0 , 0, [] ),"~i") ;
    this.relationalWorkspace.push ( new Node ("MEMBER_HOLONYM" , 0 , 0, [] ),"#m") ;
    this.relationalWorkspace.push ( new Node ("SUBSTANCE_HOLONYM" , 0 , 0, [] ),"#s") ;
    this.relationalWorkspace.push ( new Node ("PART_HOLONYM" , 0 , 0, [] ),"#p") ;
    this.relationalWorkspace.push ( new Node ("MEMBER_MERONYM" , 0 , 0, [] ),"%m") ;
    this.relationalWorkspace.push ( new Node ("SUBSTANCE_MERONYM" , 0 , 0, [] ),"%s") ;
    this.relationalWorkspace.push ( new Node ("PART_MERONYM" , 0 , 0, [] ),"%p") ;
    this.relationalWorkspace.push ( new Node ("ATTRIBUTE" , 0 , 0, [] ),"=") ;
    this.relationalWorkspace.push ( new Node ("DERIVATIONALLY_RELATED_FORM" , 0 , 0, [] ),"+") ;
    this.relationalWorkspace.push ( new Node ("DOMAIN_OF_SYNSET_TOPIC" , 0 , 0, [] ),";c") ;
    this.relationalWorkspace.push ( new Node ("MEMBER_OF_THIS_DOMAIN_TOPIC" , 0 , 0, [] ),"-c") ;
    this.relationalWorkspace.push ( new Node ("DOMAIN_OF_SYNSET_REGION" , 0 , 0, [] ),";r") ;
    this.relationalWorkspace.push ( new Node ("MEMBER_OF_THIS_DOMAIN_REGION" , 0 , 0, [] ),"-r") ;
    this.relationalWorkspace.push ( new Node ("DOMAIN_OF_SYNSET_USAGE" , 0 , 0, [] ),";u") ;
    this.relationalWorkspace.push ( new Node ("MEMBER_OF_THIS_DOMAIN_USAGE" , 0 , 0, [] ),"-u") ;
    
    this.relationalWorkspace.push ( new Node ("ENTAILMENT" , 0 , 0, [] ),"*") ;
    this.relationalWorkspace.push ( new Node ("CAUSE" , 0 , 0, [] ),">") ;
    this.relationalWorkspace.push ( new Node ("ALSO_SEE" , 0 , 0, [] ),"^") ;
    this.relationalWorkspace.push ( new Node ("VERB_GROUP" , 0 , 0, [] ),"$") ;

    this.relationalWorkspace.push ( new Node ("SIMILAR_TO" , 0 , 0, [] ),"&") ;
    this.relationalWorkspace.push ( new Node ("PARTICIPLE_OF_VERB" , 0 , 0, [] ),"<") ;
    this.relationalWorkspace.push ( new Node ("PERTAINYM" , 0 , 0, [] ),"\\") ;
    this.relationalWorkspace.push ( new Node ("DERIVED_FROM_ADJ" , 0 , 0, [] ),"\\") ;
    

    
    //init nodes
  
    addSentence( this.workspace, "quand le chat dort, les souris rêvent" )
    var boucle = function () {
	
	while ( true ) {
	    
	    //select an Ant as random
	    this.ants[0].crawl(this.workspace) ; 

	    
	    return ; 
	}
    }
    setTimeout (boucle.bind(this) 
		, 1000 ) ;
}

main() ; 


//Fourmis ajoute une phrase / traduit 
//--> Fourmis decoupe phrase en mot
//--> Fourmis ajoute definition
//-->

//ajoute definitions
