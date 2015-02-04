var natural = require('natural');
var Node    = require('./node');
var Bond = require("./Bond") 
//var manager = require('nodeManager') ; 
pos = require('pos') ; 
var wordnet =  new natural.WordNet() 
, lexer   = new pos.Lexer() 
, tagger = new pos.Tagger() ;


//The Ants crawl the nodes 
function Ant ( antPrototype ) {
    //prototype surcharge
    for ( var i in antPrototype ) {
	this[i]=antPrototype[i] ;
    }
}
Ant.prototype.crawl = function ( manager ) { 
    return manager ;
} ;




//scout can scan all nodes
//scouts can only add builder to the codeRack

//builders can't scan nodes, they have to work with nodes given at birth
//builders can only add one node and one link in the workspace
//they can add more manager

//evaluator



//scouts
var scouts = {}
, builders = {}
, cleaners  = {}  ; 


exports.scouts = scouts ;
exports.builders = builders ;
exports.cleaners = cleaners ;


//#scouts

//#printScout
scouts["printScout"] = function () {
    this.name = "Print Scout" ;
    this.crawl = function ( manager ) {
	var sum = 0 ; 
	var __manager = manager ; 
	var a =  function() { return ((1/ (__manager.codeRack.data.length || 1))) }
	this.__proto__.defaultUrgency = [ { salience : a } ] ;
 	console.log( "I have nothing to do!" ) ; 
	for( var i in scouts) {
	    var scout = new scouts[i]( ) ;	    
	    manager.codeRack.push( scout ,  urgency.bind(scout.defaultUrgency || [ 0.1 ]));
	}
	for( var i in cleaners) {
	    manager.codeRack.push( new cleaners[i]( ), urgency.bind([ 0.1 ]));
	}
    }
}

//#definitionScout
//Cherche un synset à attaché pour un lemme
scouts["definitionScout"] = function () {
    this.name = "definitionScout" ; 
    this.defaultUrgency = [ "Synset" ] ;
    this.multipleDefinitionThrsd = 0.2 ;

    this.crawl = function ( manager ) {
	//look for words without definition
	manager.workspace.iterate( 
	    function( node ) {
		var isSynset =  node.label.synsets ;
		if( !node.label.pos || node.label.pos == "o" || node.label.type != "Lemma" ) 
		    return false ; 
		var r = Math.random() ;
		if( (!isSynset) || ( r > this.multipleDefinitionThrsd )) {
		    console.log("build definition for " + util.inspect(node.label.lemma) ) ;
		    manager.codeRack.push( 
			new builders[ "definitionBuilder" ]( node )
			, urgency.bind([ manager.dictionnary.get( "Synset" )
					 , node
					 , isSynset?0.5:1 //reduce urgency for multiple definition
				       ])) ;
		}
	    }
	)
    }
}
//Cherche des synsets pour ajouter des lemmes
scouts[ "LemmeScout" ] = function() {
    this.name = "Lemme scouts" ; 
    this.defaultUrgency = [ "Lemma" ] ;

    this.crawl = function( manager ) {
	manager.workspace.iterate( 
	    function( node ) {
		if( node.label.type != "Synset" ) return ;
		
		if( Math.random() < node.salience() ) {
		    console.log("Add Lemma for " + node.label.lemma ) ;
		    
		    manager.codeRack.push(
			new builders[ "LemmeBuilder" ] ( node ) 
			, urgency.bind([
			    "Synset"
			    , node 		
			])) ;
		}
	    }
	)
    } 
    

}



//Cherche dans un lemme qui a un synset et ajoute un synonyme de ce lemme au workspace. 
scouts["SynonymScout"] = function() {
    this.name = "SynonymScout" ;
    this.defaultUrgency = [  "Lemma" 
			    , "Synonym"  ] ;
    this.synonymSpanRate = 0.9 ; // 50% chance of spawning a synonym
    this.crawl = function( manager ) {
	manager.workspace.iterate( 
	    function( node ) {
		if( node.label.type != "Lemma" ) return false ;
		if( !node.label.synsets ) return false ;
		
		
		node.label.nbSynonyms = node.label.nbSynonyms || 0 ; 
		var nbPossibleSynonyms = 0 ; 
		for( var i in node.label.synsets ) {
		    var s = manager.workspace.get( node.label.synsets[i], true ) ; 
		    if( s == undefined ) console.log( node.label.synsets[i] ) ; 
		    nbPossibleSynonyms += s.label.synonyms.length ; 		
		}
	    
		var r = this.synonymSpanRate * (nbPossibleSynonyms - node.label.nbSynonyms) / nbPossibleSynonyms
		if( Math.random() < r ) { 
		    console.log( "add synonym Builder for " + node.data + " " + r ) 
		    manager.codeRack.push( 
			new builders[ "synonymBuilder" ]( node ) 
			, urgency.bind( [ manager.dictionnary.get( "Synonym" ) 
					  , node 
					  , r 
					  //TODO: ajouter les synset dans l'urgence				      , manager.workspace.get( ) 
					]))
		    
		}
		
	    }
	)
    }
}



scouts["newSentenceScout"] = function () {
    this.name = "new sentence scout" ;
    this.defaultUrgency = ["Sentence"] ;
    //look for new sentence from the brainstorming 
    this.crawl = function ( manager ) {
	for( var i in manager.sentences ) {
	    //It while add the label : authors, id and previous id (in case of linked bs)
	    var data = {
		sentence : manager.sentences[i].translatedRes
		, id : manager.sentences[i].id 
		, author : manager.sentences[i].metaData.authors
		, previous : 0 
	    } ;
	    
	    //urgency is need for new sentence x importance of that author 
	    //TODO : salience of previous node
	    //TODO : Maybe add something with the need for words ? 1 / words ... 
	    manager.codeRack.push(
		new builders[ "newSentenceBuilder" ] ( data ) 
		, urgency.bind([ manager.dictionnary.get( "Sentence" )
				 , manager.dictionnary.get( data.author ) 
			       ])
	    ) ;
	}
	manager.sentences=[] ; 
    }
}



scouts["PhraseConstructionScout"] = function() {
    this.name = "Phrase construction scout" 
    this.crawl = function( manager ) {
	
    }
}
//#hypernymS
var relations = [{ name : "Hypernym"
		   , ptrSymbol : "@" 
		   , transitive : true 
		 }
		 , {name : "Hyponym"
		   , ptrSymbol : "" 
		   , transitive : true }
		]

for( var r in relations ) {
    relation=relations[r] ; 
    scouts[relation+"scout"] = function() {
	this.name = relation.name + " Scout" ; 
	this.defaultUrgency = [ relation.name ] ;
	this.crawl = function( manager ) {
	    manager.workspace.iterate( function( node ) {
		//focus on synset nodes
		if( node.label.type != "Synset" ) return ; 
		var maxRelations
		, currentRelations
		, lemmas ; 
		
		//Get all possible other synsets relation-related according to wordnet
		maxRelations = filterPtrs( node.label.ptrs, relation.ptrSymbol )
		if ( maxRelations.length == 0 ) return ; 
		
		//Get current relations to other synsetNodes
		links = manager.links.get( {src : node, label:relation.name, dst:"?"} )  ;
		
		//Get lemmas corresponding to this synset 
		function getLemmas( node ) {
		    //TODO FIXME should it be uniquely lemma bond ?
		    return  manager.links.get( {src : node, label:"Lemma", dst:"?"}
					       , {src : "?", label:"Synset", dst:node}) ;
		}
		lemmas = getLemmas( node ) ; 
		
		
		//--------------------------------------------------
		//Adding new synset relation-Related
		var P = ( maxRelations.length - links.length ) / maxRelations.length ; 
		if( Math.random() < P * 0.8 ) {
		    console.log( "Add new synset with " + relation.name + " relation to " + node.label.lemma ) ; 
		//#TODO : add relationBuilder 
		}
		
		//--------------------------------------------------
		//If relation is transitive connect relation related synsets
		if( relation.transitive && ( links.length > 0 ) ) {
		    for( var i in links ) {
		    var link = links[i] 
			, nextLevels = manager.links.get( { src : link.dst
							    , label : relation.name
							    , dst : "?" } ) ; 
			
			for( var j in nextLevels ) {
			    var distance2Node = nextLevels[j].dst ;
			    console.log( "link " + node + " <> " + distance2Node ) ; 
			    //TODO new Linker( node, distance2Node, relation ) ; 
			}
			
		    }
		}
		
		//--------------------------------------------------
		//Connect lemmas that have a related synset
		for( var i in links ) {
		    var relatedLemmas = getLemmas( links[i].dst ) ; 
		    for( var j in relatedLemmas ) {
			for( var l in lemmas ) {
			    console.log( "link " + lemmas[l] + "  " + relatedLemmas[j] )  ;
			    
			}
		    } 
		    
		}

	    }) ;
	}
    }
}
    
//#builders
//#newSentenceB
builders.newSentenceBuilder = function ( data ) {
    this.name = "new Sentence Builder" ;
    this.data = data ; 
    this.crawl = function ( manager ) {          
        //Add a node for the sentence
	var sentenceNode = new Node ( this.data.sentence, 0, 1, [] ) ; 
	sentenceNode.label = {
	    author : this.data.author
	    , id : this.data.id
	    , previousId : this.data.previous 
	    , type : "SENTENCE" 
	    , pos : "?" 
	}
	manager.workspace.push( sentenceNode ) ; 
	manager.links.push( new Bond( "Entity", sentenceNode, "Sentence" ) ) ;
	var words = lexer.lex( this.data.sentence ) ; 
	var taggedWords = tagger.tag( words ) ; 
	global.tgW = taggedWords ; 
	for( var i in taggedWords ) {
	    var w = taggedWords[i][0]
	    , t = taggedWords[i][1]
	    , node ;
	    var label = Object.clone ( sentenceNode.label ),
	    b = { pos : tag2pos(t) 
		      , type : "Lemma"
		      , tag : t 
		      , lemma : ( ( t === "NNS" )? natural.PorterStemmer.stem( w ) : w )
		}
	    Object.extend( label, b ) ;  
	    node = new Node ( w, 0, 1, label) ; 
	    manager.workspace.push( node ) ; 
	    manager.links.push( new Bond( sentenceNode, node, "Word" )) ; 
	}

	manager.codeRack.push( new scouts.definitionScout( ), urgency.bind([ sentenceNode ]));
    }    
}



//Definition builder, take a node and add one possible definition to the dictionnary.
//The builder uses information such as labels to choose between homographs.
//It is not biased
//If a suitable definition already exists in the dictionnary, it may use it or try a new definition
//#definitionB
builders[ "definitionBuilder" ] = function ( node ) {
    this.name = "Definition Builder " + node.label.lemma
    this.node = node ; 
    this.posBreakingPoint = 0.8 ; 
    this.crawl = function ( manager ) {
	//get the node from the workspace

	if( !manager.workspace.exists( node ) ) return ; 
	console.log( "look up definition for " + util.inspect( node ) ) ; 
	
	if ( node && node.label.type == "Lemma") {
	    var addDefinition = function ( results ) {
		//Find a synset that correspond to the pos if possible
		var synset, synsetNode ;
		if( !results.length ) return ; 
		do {
		    synset = results[ ~~( Math.random() * results.length ) ] ;
		} while ( synset.pos != node.label.pos && Math.random() < this.posBreakingPoint ) ; //
		
		//Add to dictionnary if not already in
		synsetNode = this.manager.workspace.get( synset.synsetOffset ) ; 
		if ( !synsetNode ) {
		    synsetNode = new Node ( synset.synsetOffset, 0.5, 1, [] ) ; 
		    synsetNode.label = synset ; 
		    synsetNode.label.type = "Synset"
		    this.manager.workspace.push( synsetNode ) ; 
		}
		
		//Add the reference to the synset to the lemma
		node.label.synsets =  ( ( typeof node.label.synsets == "Array" )? node.label.synsets.concat( synset.synsetOffset ) : [ synset.synsetOffset ] ) ;
		console.log( synset.lemma + " : " + synset.gloss ) ; 
		//manager.links.push ( new Bond ( synsetNode, node,  "Lemma" )) ;
		manager.links.push ( new Bond( node, synsetNode,  "Synset" )) ;
	    }
	    wordnet.lookup( node.label.lemma
			    , addDefinition.bind({ manager : manager, node : node })) ;
	}
    }
}

builders[ "LemmeBuilder" ] = function( node ) {
    this.name = "Lemme builder " ; 
    this.crawl = function( manager ) {
	if( manager.workspace.exists( node ) ) {
	    
	    //get synonyms ;
	    var synonyms = node.label.synonyms ; 
	    //Add forcefully all synonyms 
	    //Lemma can be added multiple time to the workspace
	    for( var i in synonyms ) {
		var synonymNode = new Node( synonyms[i]
					    , 0.5
					    , Math.sqrt( node.activation ) 
					    , {
						type:"Lemma"
						, synsets : [node.label.synsetOffset] 
						, lemma : synonyms[i] 
						, pos : node.label.pos
					    } ) ;  

		manager.workspace.push( synonymNode ) ;
		manager.links.push( new Bond( node, synonymNode, "Lemma" )) ; 
	    }

	}
    }



}







//Select a word in the dictionnary and add some synonyms
//on success increment synonym influence 
builders[ "synonymBuilder" ] = function( node ) {
    this.name = "synonym builder for " + node.label.lemma ;
    this.node = node ; 

    this.crawl = function( manager ) {
	if( !manager.workspace.exists( node ) ) return ; 
	var synsetNodes = [] 
	, synsetCumulativeSalience = []
	, synsetNode ;
	
	node.activate() ; 


	if ( !node.label.nbSynonyms ) node.label.nbSynonyms = 0 ;  


	//get all the synsets possible, choose randomly but biased by salience 
	for( var i in node.label.synsets ) {
	    var synset =  manager.workspace.get( node.label.synsets[i], true ) ; 
	    synsetNodes.push( synset.data ) ;
	    synsetCumulativeSalience.push( synset.salience() ) ;
	}
	var synsetOffset =  randomElementBiased( synsetNodes, synsetCumulativeSalience ) ; 
	synsetNode = manager.workspace.get( synsetOffset ) ;



	//Connect all synonyms and possibly add some more 
	for( var i in synsetNode.label.synonyms ) {

	    var lemma = synsetNode.label.synonyms[i] ;
	    //TODO: FIXME change get to search
	    
	    var synonyms = manager.workspace.search( lemma ) ; //Retrieve node if exist
	    if( !synonyms ) {
		var synonym = new Node( lemma
				    , 0
				    , 1
				    , { 
					type : "Lemma"
					, lemma : lemma
					, synsets : [ ]
					, pos : synset.label.pos 
				    }) ;
		manager.workspace.push( synonym ) ;
		node.label.nbSynonyms ++ ; 
		
	    }
	    else {
		if ( contains( synonym.label.synsets, synsetNode.label.synsetOffset ) ) {
		    console.log("skip") ; continue ; //Check if not already bound to that synset 
		}
	    }
	    //Add synset to labels
	    synonym.label.synsets = ( typeof synonym.label.synsets == "Array" )
		? synonym.label.synsets.concat( synsetNode.label.synsetOffset ) 
		: [ synsetNode.label.synsetOffset ]  ;
	    
	    //Bind the new node to its synset
	    manager.links.push( new Bond( synsetNode, synonym,  "Lemma" )) ;
//	    manager.links.push( new Bond( synonym, synsetNode,  "Synset" )) ;	    
	    manager.links.push( new Bond( node, synonym, "Synonym"  ) ) ; //FIXME: add synonym links to existing synonym 
	}
    }
}

builders[ "homographBuilder" ] = function( node ) {


}






//********************************************************************************
//Cleaners

cleaners["OtherLemma"] = function() {
    this.name = "Cleaner of useless lemma with the pos O=============================================" ;
    this.crawl = function( manager ) {
	manager.workspace.iterate( 
	    function( node ) {
		if( node.label.pos == "o" ) {
		    manager.workspace.remove( node ) ; 
		}
	    } 
	)
    }
}



//********************************************************************************






//All possible relation traversable with wordnet ptrs
function GeneratorOfRelationBuilder( relations ) {
    for ( var i in relations ) {
	builders[ relations[i].data ] = function ( node ) {
	    //get the wordnet, look for the relations[i].label 
	    
	    
	    //add link
	    
	    //increment relations[i].influence!
	}
    }
}





function contains( array, obj ) {
    for( var i in array) {
	if( array[i] === obj ) return true ;
    }
    return false ; 
}

function mergeLabel (label1, label2) {
    var results = label1 || {} ; 
    for ( var i in label2 ) {
	results[i] = ( results[i] || [] ).concat( label2[i] )  ; 
    }
    return results ; 
}

function urgency ( manager ) {
    global.__this = this ; 
    var retValue = 1 ; 
    for ( var i = 0 ; i < this.length ; i++ ) {
	if( !this[i] ) continue ; 
	switch( typeof this[i] ) {
	case "number" :
	    retValue *= this[i] ;
	    break ;
	case "string" : 
	    if( manager.dictionnary.get( this[i] ) == undefined ) console.log( this[i] ) ; 
	    retValue *= manager.dictionnary.get( this[i] ).salience() ;
	    break ;
	default :
	    retValue *= this[i].salience() ; 
	    break ; 
	}
    } 
    return retValue ; 
}

function tag2pos ( tag ) {
    if (!convert[tag]) {
	console.log("unfound tag : " + tag)
	return "o" 
    }
    return convert[tag].pos ; 

}
function randomElementBiased( elements, bias ) {
    var sum = 0
    , r = Math.random()
    , result = elements[0]  ;

    for( var i in bias ) {
	sum += bias[i] ; 
    }

    r *= sum ; 
    sum = 0 ; 
    for( var i in elements ) {
	sum+= bias[i] ; 
	if( r > sum ) 
	    return console.log("REB : "+i+"/"+elements.length), result; 
	result = elements[i] 
    }
    return result ; 
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



