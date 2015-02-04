$(init) ;
String.prototype.replaceAll = function(str1, str2, ignore) 
{
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}
function Vis () {} ; 
function Main (arg) {
    for (var i in arg ){
	if (typeof arg[i] == "function") continue
	this[i]=arg[i] ; 
    }
} ; 


var vis = new Vis(),
main = new Main ({  width:960,height:500, vis:vis}) ;
function getMain() {return main }


function defaultQuery() {
    return "PREFIX dbprop: <http://dbpedia.org/property/>\n PREFIX db: <http://dbpedia.org/resource/>\n SELECT ?who ?WORK ?genre WHERE { \n  db:Tokyo_Mew_Mew dbprop:illustrator ?who .\n  ?WORK  dbprop:author ?who .\n  OPTIONAL { ?WORK dbprop:genre ?genre } .\n}"

}
function updateQuery() {

localStorage["q1"] = 
"PREFIX dbprop: <http://dbpedia.org/property/>\n"+
"PREFIX db: <http://dbpedia.org/resource/>\n"+
"SELECT DISTINCT ?s ?o ?r ?e ?i	WHERE { \n"+
"       ?s ?r ?e.\n"+
"       ?e <http://www.w3.org/2000/01/rdf-schema#label> ?i . \n"+
"	?s  <http://www.w3.org/2000/01/rdf-schema#label> ?o . \n"+
"	?i bif:contains '"+$("#query").val() +"'.	\n"+
"        FILTER (regex(str(?i), '^"+$("#query").val()+"')) .  \n"+
"	FILTER (!regex(str(?s), '^http://dbpedia.org/resource/Category:')). \n"+
"	FILTER (!regex(str(?s), '^http://dbpedia.org/resource/List')).\n"+
"	FILTER (!regex(str(?s), '^http://sw.opencyc.org/')). \n"+
"	FILTER (lang(?o) = 'en').  	\n"+
"}	"
localStorage["q2"] = 
"PREFIX dbprop: <http://dbpedia.org/property/>\n"+
"PREFIX db: <http://dbpedia.org/resource/>\n"+
"SELECT DISTINCT ?s ?o ?r ?e ?i	WHERE { \n"+
"       ?e ?r ?s.\n"+
"       ?e <http://www.w3.org/2000/01/rdf-schema#label> ?i . \n"+
"	?s  <http://www.w3.org/2000/01/rdf-schema#label> ?o . \n"+
"	?i bif:contains '"+$("#query").val() +"'.	\n"+
"       FILTER (regex(str(?i), '^"+$("#query").val()+"')) .  \n"+
"	FILTER (!regex(str(?s), '^http://dbpedia.org/resource/Category:')). \n"+
"	FILTER (!regex(str(?s), '^http://dbpedia.org/resource/List')).\n"+
"	FILTER (!regex(str(?s), '^http://sw.opencyc.org/')). \n"+
"	FILTER (lang(?o) = 'en').  	\n"+
"}	"


    localStorage["query"] = $("#query").val() ; 
}


 

function sendQuery () {
    $.get("http://localhost:9615", {query:localStorage["q1"] }, processData ) ;
    $.get("http://localhost:9615", {query:localStorage["q2"] }, processData)
    

  
}




function shin (callBack) {
    var query = $("#query").val() ; 
    $.get("http://localhost:9615", {query:query}, callBack) ; 
}





uuid=0 ; 
function Node (label, visible) {
    this.visible = visible
    this.label = label ; 
    this.x = 100 ; 
    this.y = 200 ; 
    this.wholeString = "" ; 
    this.id = uuid++ ; 
}
cpt = 0 ; 
function NodeManager () {
    this.lastId = 0 ; 
    this.nodeId = {} ; 
    this.nodesList = [] ;    
    this.links = [] ; 
    this.linkLabel = {} ;

    this.visible = {nodeList : [], linksList : [], linkAssociativeArray:{}}

    this.addNode = function (label, visible, wholeString) {

	if (this.nodeId.hasOwnProperty(label)) {

	} else {
	    (this.nodeId[label] = this.nodesList.push(new Node(label, visible)) -1 ); 
	}

	this.nodesList[this.nodeId[label]].wholeString += wholeString + "; " ; 
	return this.nodeId[label] ; 
    }
    this.getNodeId=function(label) {
	if (this.nodeId.hasOwnProperty(label)) return this.nodeId[label] ; 
	return -1 
    }

    this.convertToGraph = function () {
	var nodes =[],
	links=[] 

	var correspondanceId = [] ;
	var existingLink = {} ; 
	for (var i in this.nodesList) {

	    var node = this.nodesList[i]
	    
	    if (node.visible) {
		correspondanceId[i] = nodes.push(node) -1 ; 
	    } else {
		correspondanceId[i] = -1 ; 
	    }
	} 

	for (var i in this.links) {
	    var link = this.links[i] ; 
	    var  smallId = Math.min (link.source, link.target) ;
	    var  bigId = Math.max (link.source, link.target) ;

	    if (existingLink[smallId]) {
		if (existingLink[smallId][bigId]) {
		    existingLink[smallId][bigId] ++ 
		    continue ; //Link exist
		} else {
		    existingLink[smallId][bigId] = 1 ; 
		}
	    } else {
		existingLink[smallId] = {} ;
		existingLink[smallId][bigId] = 1 ; 
	    }
	}
	for (var i in existingLink) {
	    for (var j in existingLink[i]) {
		var i2 =  correspondanceId[i],
		j2=  correspondanceId[j]
		if (i2 > -1 && j2 > -1)
		    links.push ({source:i2, target:j2, relation:existingLink[i][j]})
	    }
	}
	
	return {nodes:nodes, links:links}
    }

    this.addLink = function (node1, node2, label, meta,  symetric) {
	//TODO: should test if the link exist
	if (!this.linkLabel.hasOwnProperty(label)) this.linkLabel[label] = {color: d3.hsl( (119*(cpt++)) % 360, 1,0.5), count : 0}
	this.linkLabel[label].count ++ ; 
	this.links.push({source : node1, target : node2, relation : label, metaData : meta}) ;
	return 
	if (symetric) 
	    this.links.push({source : node2, target : node1, relation :( (typeof symetric == "string") ? symetric : label), metaData : meta}) ;
    }
    this.addLinks = function () {
	var args = arguments ; 
	for (var i in args) {
	    this.addLink.apply(this, args[i]) ; 
	}
    }
    this.processCompoundWords = function(str, wholeString) {
	str = str.replaceAll("''s", "'s");
	str = str.replaceAll("-", " ");
	str = str.replaceAll("o''", "of");
	//unique word
	if (str.match(/^\w$/)) {
	    return this.addNode(str, true, wholeString) ;
	}
	var words ;
	if (words = str.match(/^(\w+)\s+(\w+)$/)) {
	    var w1 = this.addNode(words[1], false,wholeString),
	        w2 = this.addNode(words[2], false,wholeString),
	        ret = this.addNode(words[0], true,wholeString) ;
	    this.addLinks(//[w1,w2,"associated", {superNode:ret}, true],
			  [ret, w1, "super", {}, "composant" ],
			  [ret, w2, "super", {}, "composant" ]
			 ) ;
	    return ret
	} 

	if (words = str.match(/^(\w+)('s| of)\s+(\w+)$/)) {
	    var w1 = this.addNode(words[1], false,wholeString),
	        w2 = this.addNode(words[3], false,wholeString),
	        ret = this.addNode(words[0], true,wholeString) ;
	    this.addLinks(//[w1,w2,"possesion", {superNode:ret}, true],
			  [ret, w1, "super", {}, "composant" ],
			  [ret, w2, "super", {}, "composant" ]
			 ) ;
	    return ret
	} 

	return this.addNode(str, true,wholeString) ; 
    }
}

var nodeManager = new NodeManager ; 

function processData (data) {
    if (typeof data == "string") ; 

    try { window.lastData=data=JSON.parse(data); } 
    catch (e) {
	console.log(data) 
    }
    
    for (var i in data.head.vars) {
    }
    for (var i in data.results.bindings) {
	var wholeString = (data.results.bindings[i]["o"].value) + " " +  data.results.bindings[i]["r"].value.match(/#(.*)/)[1] + " " + data.results.bindings[i]["i"].value
	console.log (wholeString)
	$("body").append(wholeString)
	$("body").append("<br>")
	var originNode = nodeManager.processCompoundWords (data.results.bindings[i]["o"].value, wholeString)
	var destNode = nodeManager.processCompoundWords (data.results.bindings[i]["i"].value, wholeString)
	nodeManager.addLink(originNode, destNode,  data.results.bindings[i]["r"].value.match(/#(.*)/)[1], false )
	nodeManager.nodesList[originNode].visible= true 
	nodeManager.nodesList[destNode].visible= true 
    }

//    restart () ; 
}


function processData2 (data) {
    if (typeof data == "string") ; 

    try { window.lastData=data=JSON.parse(data); } 
    catch (e) {

	console.log(data) 
    }
    console.log(data) 
    for (var i in data.head.vars) {
    }
    for (var i in data.results.bindings) {
	var originNode = nodeManager.processCompoundWords ("car", "") ; 
	var destNode   = nodeManager.processCompoundWords (data.results.bindings[i]["of1"].value, "")
	nodeManager.addLink(originNode, destNode,  data.results.bindings[i]["pf1"].value.match(/\/(.*)/)[1], false )
	nodeManager.nodesList[originNode].visible= true 
	nodeManager.nodesList[destNode].visible= true 
    }

    restart () ; 
}








function init () {

    main.vis.update


    initSvgAndForceLayout.call(main) ;    

//    d3.select(window).on("resize", resize);

    $("#query")
	.val(localStorage["query"] || defaultQuery()) 
	.change(updateQuery)
	.keyup(updateQuery)
	.blur(updateQuery)
	.focus(updateQuery);
    $("#sendQuery").click(sendQuery) ; 


}

//*************************************----***************************************
//************************************------**************************************
//********************************GraphicalStuff**********************************
//************************************------**************************************
//*************************************----***************************************


function restart () {
    

    main = getMain () ;
    var G = nodeManager.convertToGraph()
 
    main.force.nodes(G.nodes, function (d){return d.id}) ;
    main.force.links(G.links) ; 
    main.force.start();

    
    

    var enteringNode = main.vis.svg.selectAll("g.node")
	.data(main.force.nodes(), function (d) {return d.id})
	.enter().insert("svg:g")
	.attr("class", "node") 
	.attr("transform",  function(d) { 
	    return "translate(" +( d.x - d.width/2) +", " +( d.y + d.height/3)+ ")"
	})
    	.call(main.force.drag);


    enteringNode.insert("rect")
	.attr("class", "background") 
        .attr("rx",5)
	.attr("ry",5)
	.style("stroke", function(d){	    return d3.hsl(d.weight*10,1,0.5)	})
	.style("stroke-width", function(d){	    return 1	})
    

    enteringNode.append("text")
	.attr("class", "label")
	.text(function(d, i) { return d.label ; }) 
	.attr("data-mydata", function (d) {return d.wholeString})
	.style("font-size", 12)
	.each(function (d) {
	    var bbox = this.getBBox() ; 
	    d.width = bbox.width + 10 ,
	    d.height = bbox.height || 14; 
	});
	    
    var enteringLink = main.vis.svg.selectAll("line.link")
	.data(main.force.links())
	.enter().insert("line", ".link")
	.style("stroke-width", function(d){	    return 1	})
    	.attr("class", "link")
	.style("stroke", function(d) { return nodeManager.linkLabel[d.label].color})

    main.vis.nodes = enteringNode;
}
function refresh (main) {
 
    main.vis.svg.selectAll("g.node")
	.attr("transform",  function(d) { 
	    return "translate(" +( d.x - d.width/2) +", " +( d.y + d.height/3)+ ")"
	}).selectAll("rect") 
	.attr("width", function (d) { return d.width })
	.attr("height", function (d) { return d.height })
	.attr("y",function(d){
	    return -d.height + 4
	})
	.attr("x",function(d){
	    return -5
	})

    main.vis.svg.selectAll("line.link")
	.attr("x1", function(d) {  return d.source.x||0; })
	.attr("y1", function(d) { return d.source.y||0; })
   	.attr("x2", function(d) {return d.target.x||0; })
	.attr("y2", function(d) { return d.target.y||0; });
}

function initSvgAndForceLayout (width, height) {
    this.fill = d3.scale.category20();
    this.force = d3.layout.force()
	.size([this.width, this.height])
	.nodes([{}]) 
	.gravity(0.15) 
	.linkDistance(10)
	.linkStrength(0.7)
	.charge(-30)
	.on("tick", createTick(this) );
    this.vis.svg = d3.select("body")
	.append("svg")
	.attr("width", this.width)
	.attr("height", this.height)

    resize() ; 
    return this ; 
}


function tick(main) {
    var nodes = main.force.nodes(); 
    var q = d3.geom.quadtree(nodes) 
    i = 0,
    n = nodes.length;
    while (++i < n) {
    	q.visit(collide(nodes[i]));
    }

    refresh(main) ; 
}
function createTick (main) { return  function () {tick(main) }}
//Node---------------------------------------------------------------


function collide(node) {
    var rx = node.width + 16, ry = node.height + 4, 
    nx1 = node.x - rx,
    nx2 = node.x + rx,
    ny1 = node.y - ry,
    ny2 = node.y + ry;
    return function(quad, x1, y1, x2, y2) {
	if (quad.point && (quad.point !== node)) {
	    var x =(node.x - quad.point.x),
	    y = (node.y - quad.point.y),
	    ax =  Math.abs(x),
	    ay =  Math.abs(y),
	    rx = (node.width + quad.point.width + 5) /2,
	    ry = (node.height + quad.point.height + 5 )/2 ;
	    if (ax < rx && ay < ry) {
		if ( rx- ax < ry-ay) {
		    ax = (ax - rx) / ax * .5;
		    node.x -= x *= ax;
		    quad.point.x += x;
		} else {
		    ay = (ay - ry) / ay * .5;
		    node.y -= y *= ay;
		    quad.point.y += y;
		}

	    }
	    if (isNaN(node.y)) node.y = 1  ;
	    if (isNaN(node.x)) node.x = 1  ;
	}
	return x1 > nx2
	    || x2 < nx1
	    || y1 > ny2
	    || y2 < ny1;
    };
}




function resize() {
    main.width = window.innerWidth, main.height = window.innerHeight;
    main.vis.svg.attr("width", main.width).attr("height", main.height);
    if (main.nodes) {
	var dx =  main.width/2  - main.nodes[0].x,
        dy =  main.height/2 - main.nodes[0].y;
	for (var i in main.nodes) {
	    main.nodes[i].x += dx
	    main.nodes[i].y +=dy ;
	} 
	main.nodes[0].px += dx ;

	main.nodes[0].py += dy ;


    }
    main.force.size([main.width, main.height]).resume();


}
