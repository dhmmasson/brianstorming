$(init)
Array.prototype.last = function () {return this[this.length-1]}
var colors = []
var maxColor = 36
for (var i = 0 ; i < maxColor ; i ++) colors.push ( "hsl(" + ~~(360/maxColor*i) + ",95%, 85%)") ;
colors.__proto__.getOne = function () {
    var i =  ~~(Math.random()*colors.length)  ; 
    var ret = this[i] ; 
    this.splice(i,1) ; 
    return ret ; 
}


{
    var uuid_i = 0 ; 
    function uuid (str) {
	var a = 0 ; 
	for (var i in str) {
	    a*= 181 ; 
	    a += str.charCodeAt(i) ; 
	}
	return (a%104729) +"." + (uuid_i++)*( (new Date()).getTime() %104729)  ;
    }

}
function Force () {} ;
function MetaData (args) {
    this.color = "red"        ;
    this.timestamp = (new Date()).getTime()       ; 
    this.authors = "Anonymous" ; 
    jQuery.extend(true, this, args);


}
function Node (content, metaData) {
    
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



function initSocket (main) {
    console.log (main.address) 
    main.socket = io.connect(main.address) ; //window.location.host +':8888/');
    main.socket.on ("active_brainstormings", function (data) {
	console.log(data) 
	$("#brainstormingList").remove()
	$(".infobox").append("<ul id='brainstormingList'></ul>")

	var brainstormingList = $("#brainstormingList")
	for (var i in data.brainstorming) {
	    if(typeof data.brainstorming[i] == "function") continue
	    brainstormingList.append('<li class="ui-widget-content existingBs" id="'+data.brainstorming[i]+'">'+data.brainstorming[i]+'</li>')
	}

	brainstormingList.append('<li class="ui-widget-content" id="_bs_new"><input placeholder="create new brainstorming"/></li>') ;
	var aux = function () { 
	    return function () {
		if (this.value) {
		    main.socket.emit ("create", {name:this.value} )
		    data3.content=this.value ; 
		    initBrainstorming(main.vis,main) ; 

		}
	    }}

	$("#_bs_new input").change(aux()).blur(aux()) ;
	var aux2 = function () {
	    return function(){
		main.socket.emit ("join", {name :  this.id} )
		data3.content=this.id ; 
		initBrainstorming(main.vis,main) ; 
	    }}

	$(".existingBs").click(aux2())
    }) ; 



    main.socket.on('connect', function () {
	$("#serveurAddress").after("<span class='ok'>&#x2713;</span>")
	//Ask for the list of brainstorming
	main.socket.emit("list", "");
	
    });

    main.send = function (data) {
	main.socket.emit( ((data instanceof Node) ? "node":"link") , data);
    }
    main.socket.on('message', function (data){
	receive(data)
    } );
    main.socket.on("nodes",  function (d){console.log("nodes ") ;  receive("node",d.data)} )
    main.socket.on("node", function (d){console.log("node ") ;    receive("node",[d.data])} )
    main.socket.on("links", function (d){console.log("onlinks !" ); 
					 receive("link",d.data)} )
    main.socket.on("link", function (d){console.log("onlink " );   
					receive("link",[d.data])} )
    main.socket.on("error", function (data) {
	var a = document.createElement("div") ;
	    a.setAttribute("class","error")
	    a.innerText = data.message ;
	$("body").append(a) ;
	setTimeout( (function () {return function () {$(a).fadeOut(400, function () {$(this).remove() })  } ;}) (), 2000 )

    })

}




var nodes_ = [],
data3 =   new Node("Brainstorming", {color:"white", 
				     timestamp : (new Date()).getTime(), 
				     authors:"initial", 
				     "class": "initial"}
		  )






function initSvgAndForceLayout (width, height) {
    this.fill = d3.scale.category20();
    this.force = d3.layout.force()
	.size([this.width, this.height])
	.nodes(nodes_) 
	.gravity(0.05) 
	.linkDistance(20)
	.linkStrength(0.7)
	.charge(-300)
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

	this.vis.previousLabel = this.vis.nodes.filter(createFilter(this.previousLabel.id)) ; 
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
	main.nodes[0].px += dx
	main.nodes[0].py += dy
    }
    main.force.size([main.width, main.height]).resume();


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
	.text(function(d, i) { return d.content ; }) 
	.style("font-size", 12)
	.each(function (d) {
	    var bbox = this.getBBox() ; 
	    d.width = bbox.width + 10 ,
	    d.height = bbox.height || 14; 
	})
	    this.backgrounds
	.attr("width", function (d) { return d.width })
	.attr("height", function (d) { return d.height })
        .attr("rx",5)
	.attr("ry",5)
	.attr("y",function(d){
	    return -d.height + 4
	})
	.attr("x",function(d){
	    return -5
	})
	.style("stroke", function(d){
	    return d.metaData.color})
    return this ; 
}
function nodeOnExit() {

}




//Link visualisation ---------------------------------------------------
function linkOnEnter () {

    this.links.enter().insert("line", ".node")
	.attr("class", "link")
	.attr ("fill", function (d) {return d.metaData.color})
    return this ; 
}
function linkOnUpdate () {
    this.links.attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
   	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });
    return this ; 
}
function linkOnExit () {
    

    return this 
}




function restart() {

    this.nodes[0].fixed= true ; 
    this.refreshElements () ; 
    this.vis.nodes = this.vis.nodes.data(this.nodes, function (d){return d.id});
    this.vis.links = this.vis.links.data(this.links);   

    this.vis.links.exit().remove() ;
    this.vis.nodes.exit().remove() ;

    this.vis
	.createNode()
	.createLink()
	.updateNode() 
        .updateLink() 
    this.vis
        .exitLink()
	.exitNode()
    
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

function setFocus()
{
    document.getElementById("tapetita").focus();
    setTimeout(setFocus, 300) ;
}


function init () {
    //default settings--------------------------------------
    
    
    





    var vis = new Vis(),
    main = new Main ({  width:960,height:500, vis:vis}) ;

    function getMain(){return main}

    function tryInitSocket (e) {
	main.author=$("#name").val() || "Anonymous" + ~~(Math.random() *1000)
	var address = (e.currentTarget.value) ;
	address = (address.match(/\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}:\d{1,4}/)) ;
	if (address) {
	    localStorage["address"]=address;
	    localStorage["name"]=main.author;
	    
	    main.address = address ;
	    initSocket(main) ;
	}

	//	
	
    }
    $("#name").val(localStorage["name"]|| "Anonymous" + ~~(Math.random() *1000))
    $("#serveurAddress")
	.change(tryInitSocket)
	.keyup(tryInitSocket)
	.blur(tryInitSocket)
	.focus(tryInitSocket)
	.val(localStorage["address"]||"")
    


    

    //    initBrainstorming(vis, main) ; 

}
function initBrainstorming (vis, main) {
    $(".infobox").remove()
    function getMain(){return main}
    var textInput = document.querySelector('input');
    new FastClick(document.body);
    document.body.addEventListener('click', function(e) {
	textInput.focus();
	mousedown.call(e.target, getMain())
    }, false) ;


    
    setFocus() ; 
    


    Vis.prototype.createNode = nodeOnEnter ;
    Vis.prototype.updateNode = nodeOnUpdate ;
    Vis.prototype.exitNode = nodeOnExit ;
    Vis.prototype.createLink = linkOnEnter ;
    Vis.prototype.updateLink = linkOnUpdate ;
    Vis.prototype.exitLink = linkOnExit ;
    Vis.prototype.refreshElements = refreshVisElements ; 

    Main.prototype.refreshElements = refreshElements ; 
    Main.prototype.restart         = restart ; 


    data3.fixed = true ; 
    data3.x = main.width/2 ;
    data3.y = main.height/2 ; 

    nodes_ = [data3] ; 
    d3.select(window).on("resize", resize);
    document.body.addEventListener("touchend", createMouseDown(main))
    //export to window
    window.main=main ; 
    //--Init Svg and force layout----------------------------
    initSvgAndForceLayout.call(main) ;
    resize() ;
    






    main.refreshElements();

    
    
    
    main.previousLabel=main.nodes[0] ; 
    
    main.refreshElements() ;

    //Create Cursor -----------------------------------------

    main.restart();


    

    $("#tapetita").keyup(function (e) {
	
	if(e.which == 13) {
	    EnterKeyDown.call(this, e) ;
	}
	if (main.currentLabel == undefined) {
	    newNode() ;
	} else if ((e.which > 46 || e.which == 8) && e.which != 91 ) {
	    main.currentLabel.content = this.value ; 
	    main.restart() ; 
	}
	
    })
    

    newNode;
    
}

function receive (type, data) {
    for (var i in data) {
	if (typeof data[i]  == "function" ) continue 
	
	var e = data[i];
	if (type == "link") {
	    var l = new Link(e.source,e.target, e.rel, e.metaData ) ;  
	    var source = false, target = false ;
	    for (var i in main.nodes) {
		if (main.nodes[i].id == l.source) source = main.nodes[i]
		if (main.nodes[i].id == l.target) target = main.nodes[i]
	    }
	    if (source && target) {
		l.source = source ; 
		l.target = target ; 
		main.links.push (l) 
	    } else {
		function aux_tt (data) { return function () {receive ("link", [data])} } ;
		setTimeout(aux_tt(e),2000) ; 
	    }
	}
	else if (type == "node") {
	    var n = new Node (e.content,e.metaData) ; 
	    n.id = e.id ;
	    console.log(n) ; 
	    var t = true
	    for (var i in main.nodes) {
		t = t && (main.nodes[i].id != n.id)  ;
	    }
	    if (t) main.nodes.push (n) 
	}
    }
    main.restart() ; 
}
function EnterKeyDown (e) {
    if (this.value == "") {
	for (var i in main.nodes) {
	    if (main.nodes[i] == main.currentLabel) {
		main.nodes.splice(i,1)
		break ; 
	    }
	}
	for (var i in main.links) {
	    if (main.links[i].source == main.currentLabel) {
		main.links.splice(i,1) ; 
	    }
	}
	main.currentLabel = main.previousLabel ; 
    } else {
	var nodeToSend = new Node(main.currentLabel.content, main.currentLabel.metaData) ;
	nodeToSend.id = main.currentLabel.id ; 
	
	main.send ( nodeToSend )
	for (var i in main.links) {

	    if (main.links[i].source && main.links[i].source.id == nodeToSend.id) {
		var l = JSON.parse(JSON.stringify(main.links[i])) 
		l.source = l.source.id ; 
		l.target = l.target.id ;

		main.send ( l ) ;
	    }
	}

    }

    this.value = ""
    if(main.previousLabel)
	main.previousLabel.class = undefined ; 
    if(main.currentLabel) {
	main.currentLabel.class = undefined ; 
	main.currentLabel.fixed=false ;
	main.previousLabel = main.currentLabel ; 
    }
    main.currentLabel = undefined 
    main.lastEnterShifted = e.shiftKey ;
    if (e.shiftKey==false && main.previousLabel) {
	main.previousLabel.class = "previous" ; 
    } else {
	main.previousLabel =main.nodes[0];
    }

}
function newNode () {
    var pos = {x :~~main.vis.cursor.attr("x"), y:~~main.vis.cursor.attr("y")} ;
    var color = 0 ;
    if (main.lastEnterShifted==false && main.previousLabel) {
	var dx = (main.previousLabel.x  - main.width/2),
	dy = (main.previousLabel.y  - main.height/2),
	norm = Math.sqrt(dx*dx+dy*dy) ;
	
	pos.x = main.previousLabel.x + 20* dx/norm ;
	pos.y = main.previousLabel.y+ 20* dy/norm ;
	if (main.previousLabel.metaData.color  != "white")
	    color = main.previousLabel.metaData.color 
	
    }
    if (!color) color = colors.getOne() ; 
    node = new Node (this.value || "type your message", {authors: main.author, color:d3.hsl(color).darker(0.3).toString()})
    jQuery.extend(true, node, {x: pos.x, y: pos.y, fixed: false} );
    main.nodes.push(node);
    
    
    var link = new Link (node,main.previousLabel, "next", {color:d3.hsl(color).darker(0.3).toString(), authors: main.author}) 
    main.links.push(link) ; 
    
    main.currentLabel = node ; 
    main.restart();
}

function mousemove(cursor) {
    cursor.attr("x", d3.mouse(this)[0]) 
	.attr("y", d3.mouse(this)[1]) 
	.attr("transform", "translate(" + d3.mouse(this) + ")");
}

function mousedown(main) {
    var     node =  d3.select(this).datum() ;
    if (node && node != main.currentLabel && node != main.previousLabel) {
	
	EnterKeyDown.call ($("#tapetita")[0], new jQuery.Event("keyup", { keyCode: 13, which:13, shiftKey:false })) 
	main.previousLabel = node ; 
	newNode() ; 
    }
    
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