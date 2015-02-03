$(init)
Array.prototype.last = function () {return this[this.length-1]}
var colors = []
var maxColor = 16
for (var i = 0 ; i < maxColor ; i ++) colors.push ( "hsl(" + ~~(360/maxColor*i) + ",95%, 10%)") ;
colors.__proto__.getOne = function () {
    var i =  ~~(Math.random()*colors.length)  ; 
    var ret = this[i] ; 
    this.splice(i,1) ; 
    return ret ; 
}




data2 = {"1.0":{"session":1,"id":0,"versions":[{"mid":"1.0","id":0,"timestamp":1355836355725,"authors":"Dimitri H. Masson","content":"Some Text","links":{"1.0.0:previous>1.2.0":{"src":"1.0.0","rel":"previous","dst":"1.2.0","metaData":{},
																						  "signature":"1.0.0:previous>1.2.0"}},"metaData":{"x":120,"y":200}},
					       {"mid":"1.0","id":1,"timestamp":1355836355727,"authors":"Dimitri H. Masson","content":"let it be1.0","links":{},"metaData":{"x":120,"y":200}},
					       {"mid":"1.0","id":2,"timestamp":1355836355727,"authors":"Dimitri H. Masson","content":"let it be1.0","links":{},"metaData":{"x":120,"y":200}}]},
	 "1.1":{"session":1,"id":1,"versions":[{"mid":"1.1","id":0,"timestamp":1355836355726,"authors":"Dimitri H. Masson","content":"Some Other Text","links":{"1.2.0:next>1.1.0":{"src":"1.2.0","rel":"next","dst":"1.1.0","metaData":{},"signature":"1.2.0:next>1.1.0"}},"metaData":{"x":120,"y":200}}]},
	 "1.2":{"session":1,"id":2,"versions":[{"mid":"1.2","id":0,"timestamp":1355836355726,"authors":"John Lennon","content":"Imagine","links":{"1.0.0:previous>1.2.0":{"src":"1.0.0","rel":"previous","dst":"1.2.0","metaData":{},"signature":"1.0.0:previous>1.2.0"},"1.2.0:next>1.1.0":{"src":"1.2.0","rel":"next","dst":"1.1.0","metaData":{},"signature":"1.2.0:next>1.1.0"}},"metaData":{"x":20,"y":2}}]},
	 "1.3":{"session":1,"id":3,"versions":[{"mid":"1.3","id":0,"timestamp":1358500700391,"authors":"dimitri","content":"hello2","links":{},"metaData":{}}]},
	 "1.4":{"session":1,"id":4,"versions":[{"mid":"1.4","id":0,"timestamp":1358505160877,"authors":"dimitri","content":"My first Message","links":{},"metaData":{}}]},
	 "1.5":{"session":1,"id":5,"versions":[{"mid":"1.5","id":0,"timestamp":1358505160883,"authors":"John Doe","content":"bonjour", "links":{},"metaData":{}}]},
	 "1.6":{"session":1,"id":6,"versions":[{"mid":"1.6","id":0,"timestamp":1358505193640,"authors":"dimitri","content":"My first Message","links":{},"metaData":{}}]},
	 "1.7":{"session":1,"id":7,"versions":[{"mid":"1.7","id":0,"timestamp":1358505193647,"authors":"John Doe","links":{},"metaData":{}, "content":"Hey there"}]}}

{
var uuid_i = 0 ; 
function uuid (str) {
    var a = 0 ; 
    for (var i in str) {
	a*= 181 ; 
	a += str.charCodeAt(i) ; 
    }
    return a +"." + (++uuid_i) ; 
}

}
function Force () {} ;
function MetaData (args) {
    if (args instanceof MetaData) { 
	 jQuery.extend(true, this, args);
    } else {

	this.color = "red"        ;
	this.timestamp = ""       ; 
	this.authors = "Bon Jovi" ; 
    }

}
function Node (content, metaData) {
    
    this.force    = new Force () ;
    this.metaData = new MetaData (metaData) ; 
    this.content  = content ;
    this.id       = uuid(this.metaData.authors ) ; 

}
function Link (src,dst, rel, metaData) {
    this.source = src ; 
    this.rel    = rel ;
    this.target = dst ;
    this.metaData = new MetaData(metaData)  ; 
}


var data3 = [] ; 
data3.push(  new Node("Brainstorming", new MetaData()
		     

) )

var nodes_ = [] ; 
for (var i in data2) {
    data2[i].width=100;
    data2[i].height=100;
    data2[i].versions.last().metaData.color = colors.getOne() ; 
    nodes_.push (
	data2[i]
    )
}


function initSvgAndForceLayout (width, height) {
    this.fill = d3.scale.category20();
    this.force = d3.layout.force()
	.size([this.width, this.height])
	.nodes(nodes_) 
	.linkDistance(20)
	.linkStrength(0.7)
	.charge(-60)
	.on("tick", createTick(this) );
    this.vis.svg = d3.select("body")
//	.on("keydown", createKeyDown(this) ) 
	.append("svg")
	.attr("width", this.width)
	.attr("height", this.height)
	.on("mousemove", createMouseMove(this)   )
	.on("mousedown", createMouseDown(this) )

    this.vis.cursor = this.vis.svg.append("circle")
	.attr("r", 30)
	.attr("transform", "translate(-100,-100)")
	.attr("class", "cursor");



    return this ; 
}




function transcribeNodeToLInk (nodes,links) {
    var tmpNode = {} ;
    for(var i = 0; i < nodes.length; i++) {
	tmpNode[nodes[i].session +"." +nodes[i].id] = i+1 ; 
	var ll = nodes[i].versions.last().links ; 
	for (var j in ll) {
	    var src = ll[j].src.split(".").slice(0,2).join(".")
	    var dst = ll[j].dst.split(".").slice(0,2).join(".")
	    if (tmpNode[src] && tmpNode[dst]) {
		//pushback unused colors 
		colors.push( nodes[tmpNode[src]-1].versions.last().metaData.color)
		nodes[tmpNode[dst]-1].versions.last().metaData.color=  nodes[tmpNode[src]-1].versions.last().metaData.color;
		links.push({
		    color  : nodes[tmpNode[src]-1].versions.last().metaData.color,
		    source : tmpNode[src]-1,
		    target : tmpNode[dst]-1,
		    weight : 1
		});
	    }
	}
    }
}

function refreshElements () {
    this.nodes = this.force.nodes() ; 
    this.links = this.force.links() ;

    this.vis.refreshElements () ; 

    var createFilter = function (id) { 
	return function (d) {
	    return d.id == id
	}}


    if (this.currentLabel)
	this.vis.currentLabel = this.vis.nodes.filter(createFilter(this.currentLabel.id)) ; 
    if (this.previousLabel) {

	this.vis.previousLabel = this.vis.nodes.filter(createFilter( this.previousLabel.id)) ; 
    } 
    return this ; 

}
function refreshVisElements () {

    this.nodes       = this.svg.selectAll (".node") ;
    this.links       = this.svg.selectAll (".link")  ;
    this.labels      = this.nodes.selectAll(".label") ;
    this.backgrounds = this.nodes.selectAll(".background") ;
    return this ; 
}




function tick(main) {
    var q = d3.geom.quadtree(main.nodes),
    i = 0,
    n = main.nodes.length;
	while (++i < n) {
    	    q.visit(collide(main.nodes[i]));
	}
    main.vis.updateNode()
	.updateLink() ; 
}



//Node---------------------------------------------------------------
function nodeOnEnter () {
    var enteringNode = this.nodes.enter().insert("svg:g")
	.attr("class", "node") ;
    enteringNode.append("rect")
	.attr("class", "background") ;
    enteringNode.append("text")
	.attr("class", "label")
    return this ; 
}
function nodeOnUpdate() {

    this.refreshElements () ; 
    this.nodes
    	.attr("class", function(d){ return "node"})

	.attr("transform",  function(d) { 
	    return "translate(" +( d.x - d.width/2) +", " +( d.y + d.height/3)+ ")"
	})
	.on("mousedown", createMouseDown(main) );
    
 
    if (this.currentLabel)
	this.currentLabel
	.attr("class", "node current")
    if (this.previousLabel)
	this.previousLabel
	.attr("class", "node previous")
	      
    this.labels
	.text(function(d, i) { return d.versions.last().content ; }) 
	.style("font-size", 12)
	.each(function (d) {
	    var bbox = this.getBBox() ; 
	    d.width = bbox.width + 10 ,
	    d.height = bbox.height || 10; 
	})
    this.backgrounds
	.attr("width", function (d) { return d.width })
	.attr("height", function (d) { return d.height })
	.attr("y",function(d){
	    return -d.height + 3
	})
	.style("fill", function(d){
	    return d.versions.last().metaData.color})
    return this ; 
}





//Link visualisation ---------------------------------------------------
function linkOnEnter () {

    this.links.enter().insert("line", ".node")
	.attr("class", "link")
	.attr ("fill", function (d) {return d.color})
    return this ; 
}
function linkOnUpdate () {
    this.links.attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
   	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });
    return this ; 
}


    


function restart() {


    this.refreshElements () ; 
    this.vis.nodes = this.vis.nodes.data(this.nodes, function (d){return d.id});
    this.vis.links = this.vis.links.data(this.links);   

    this.vis
	.createNode()
	.createLink()
	.updateNode() 
        .updateLink() 
    
    this.vis.nodes.call(this.force.drag);
    this.force.start();
    return this ; 
}







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
		    ax = (ax - rx) / ax * .3;
		    node.x -= x *= ax;
		    quad.point.x += x;
		} else {
		    ay = (ay - ry) / ay * .3;
		    node.y -= y *= ay;
		    quad.point.y += y;
		}

	    }
	}
	return x1 > nx2
	    || x2 < nx1
	    || y1 > ny2
	    || y2 < ny1;
    };
}

function Vis () {} ; 
function Main (arg) {
     for (var i in arg ){
	 if (typeof arg[i] == "function") continue
	 this[i]=arg[i] ; 
     }
} ; 

function init () {
    //default settings--------------------------------------
   
    function setFocus()
    {
	document.getElementById("tapetita").focus();
	setTimeout(setFocus, 300) ;
    }
    setFocus() ; 
 


    Vis.prototype.createNode = nodeOnEnter ;
    Vis.prototype.updateNode = nodeOnUpdate ;
    Vis.prototype.createLink = linkOnEnter ;
    Vis.prototype.updateLink = linkOnUpdate ;
    Vis.prototype.refreshElements = refreshVisElements ; 

    Main.prototype.refreshElements = refreshElements ; 
    Main.prototype.restart         = restart ; 


    var vis = new Vis(),
        main = new Main ({  width:960,height:500, vis:vis}) ;


    //export to window
    window.main=main ; 
    //--Init Svg and force layout----------------------------
    initSvgAndForceLayout.call(main) ;


    







    main.refreshElements();

    transcribeNodeToLInk(main.nodes,main.links) ;
    
    
    main.previousLabel=main.nodes[0] ; 
  
    main.refreshElements() ;

    //Create Cursor -----------------------------------------

    main.restart();



   
   $("#tapetita").change(function (evt) {
       //clear
       this.value = ""
       if(main.previousLabel)
	   main.previousLabel.versions.last().previous = undefined ; 
       if(main.currentLabel) {
	   main.currentLabel.versions.last().current = undefined ; 
	   main.currentLabel.fixed=false ;
	   main.previousLabel = main.currentLabel ; 
       }
       main.currentLabel = undefined 

    }).keyup(function (e) {
	if(e.which == 13) {
	    main.lastEnterShifted = e.shiftKey ;
	    if (e.shiftKey==false && main.previousLabel) {
		main.previousLabel.versions.last().previous = true ; 
	    }

	}
	if (main.currentLabel == undefined) {
	    var pos = {x :~~main.vis.cursor.attr("x"), y:~~main.vis.cursor.attr("y")} ;
	    var color = colors.getOne() ; 
	    if (main.lastEnterShifted==false && main.previousLabel) {
		var dx = (main.previousLabel.x  - main.width/2),
	            dy = (main.previousLabel.y  - main.height/2),
		    norm = Math.sqrt(dx*dx+dy*dy) ;

		pos.x = main.previousLabel.x + 20* dx/norm ;
		pos.y = main.previousLabel.y+ 20* dy/norm ;

		color = main.previousLabel.versions.last().metaData.color 
		
	    }
            node  = {x: pos.x, y: pos.y, 
		     fixed: true,
		     "session":1,"id":~~1000000*Math.random(),
		     "versions":[{"mid":"1.7","id":0,
				  "timestamp":1358505193647,
				  "authors":"John Doe","links":{},
				  "metaData":{color : color}, 
				  "content":" " + this.value,
				  "current":true 
				 }]}
	    main.nodes.push(node);

	    if (main.lastEnterShifted==false) {
		if (node && main.previousLabel) 
		main.links.push({source: node, target: main.previousLabel});
	    }
	    main.currentLabel = node ; 
	    main.restart();
	} else {
	    main.currentLabel.versions.last().content = this.value ; 
	    main.restart() ; 
	}
	
    })
  
   





}



function mousemove(cursor) {

    cursor.attr("x", d3.mouse(this)[0]) 
	.attr("y", d3.mouse(this)[1]) 
	.attr("transform", "translate(" + d3.mouse(this) + ")");
}

function mousedown(main) {
    $("#tapetita").change() ;
    main.previousLabel = d3.select(this).datum() ;
    $("#tapetita").trigger (jQuery.Event("keyup", { keyCode: 13, which:13, shiftKey:false }))  ;

}


function createMouseDown (main) {
    return function () {
	mousedown.call(this, main)
    }
}
function createMouseMove (main) {
    return function () {
	mousemove.call(this, main.vis.cursor) ;
    }
}


function createKeyDown (main) {
    var keyDown=function (main) {
	var e = d3.event ;
	evt = e || window.event;
	var charCode = evt.which || evt.keyCode;
	var charStr = String.fromCharCode(charCode);
	

    



    }
    return function (e) {
	keyDown.call(this, main)
    }
}

function createTick (main) { return  function () {tick(main) }}
