var data = [];

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
for (var i in data2) {
    data.push(data2[i])
}

Array.prototype.last = function () {return this[this.length-1]}
function shuffle(array) {
    var m = array.length, t, i;
    while (m) {
	i = Math.floor(Math.random() * m--);
	t = array[m], array[m] = array[i], array[i] = t;
    }
    return array;
}
id = 7 ; 
$(function() {
    
    var w = 500, h = 500;
    var force, force2 ; 
    var labelDistance = 0;
    var nodes = [];
    var labelAnchors = [];
    var labelAnchorLinks = [];
    var links = [];
    var tickEtTock = function () { console.log("hello")} ; 
    var vis = d3.select("body")
	.append("svg:svg")
	.attr("width", w)
	.attr("height", h)
	.on("mousemove", mousemove)
	.on("mousedown", mousedown)
	.on("keydown", function (e) {console.log(e)});

    d3.select(window)
	.on("keydown", function() {  console.log( altKey = d3.event.altKey); })
	.on("keyup", function() { altKey = false; })

    vis.append("rect")
	.attr("width", w)
	.attr("height", h);
    
    var link = vis.selectAll("line.link")
    var node0 = vis.selectAll("g.node")
    var anchorLink = vis.selectAll("line.anchorLink")
    var anchorNode = vis.selectAll("g.anchorNode")

    var cursor = vis.append("circle")
	.attr("r", 30)
	.attr("transform", "translate(-100,-100)")
	.attr("class", "cursor");


    
    force = d3.layout.force()
	.size([w, h])
	.gravity(4)
	.linkDistance(30)
	.charge(-3000)
	.linkStrength(function(x) {
	    return x.weight * 3
	});

    force2 = d3.layout.force()
	.size([w, h])
	.gravity(0)
	.linkDistance(2)
	.linkStrength(8)
	.charge(-200);
    
     function  updateLink() {

	this.attr("x1", function(d) {
	    return d.source.x;
	}).attr("y1", function(d) {
	    return d.source.y;
	}).attr("x2", function(d) {
	    return d.target.x;
	}).attr("y2", function(d) {
	    return d.target.y;
	});
    }
     function  updateNode() {
	this.attr("transform", function(d) {
	    return "translate(" + d.x + "," + d.y + ")";
	});
    }
var cpt = 0 ; 
    function update  () {
cpt++ ;
	nodes = [];
	labelAnchors = [];
	labelAnchorLinks = [];
	links = [];
	
	for(var i = 0; i < data.length; i++) {
	    var node = {
		color : colors[i%8],
		label :  data[i].versions.last().content 
	    };
	    nodes.push(node);
	    labelAnchors.push({
		node : node
	    });
	    labelAnchors.push({
		node : node
	    });
	};

	var tmpNode = {} ;
	for(var i = 0; i < data.length; i++) {
	    tmpNode[data[i].session +"." +data[i].id] = i+1 ; 
	    var ll = data[i].versions.last().links ; 
	    for (var j in ll) {
		var src = ll[j].src.split(".").slice(0,2).join(".")
		var dst = ll[j].dst.split(".").slice(0,2).join(".")
		if (tmpNode[src] && tmpNode[dst]) {
		    nodes[tmpNode[dst]-1].color=  nodes[tmpNode[src]-1].color;
		    links.push({
			color  : nodes[tmpNode[src]-1].color,
			source : tmpNode[src]-1,
			target : tmpNode[dst]-1,
			weight : 1
		    });
		}
	    }
	    labelAnchorLinks.push({
		source : i * 2,
		target : i * 2 + 1,
		weight : 1
	    });
	}
	

	force.nodes(nodes)
	    .links(links)
	    .start()
	    .on("tick", tickEtTock );
	force2.nodes(labelAnchors)
	    .links(labelAnchorLinks)
	    .start();


	link = vis.selectAll("line.link")
	node0 = vis.selectAll("g.node")
	anchorLink = vis.selectAll("line.anchorLink")
	anchorNode = vis.selectAll("g.anchorNode").data([]) ; 


	console.log(force2.nodes()) ; 
	link.data(links)
	    .enter().append("svg:line")
            .attr("class", "link")
            .style("stroke", function(d) { return d.color});
	node0.data(force.nodes())
	    .enter().append("svg:g")
            .attr("class", "node");
	node0.append("svg:circle")
	    .attr("r", 5).style("fill", function(d) {return d.color} )
	    .style("stroke", "#eee")
	    .style("stroke-width", 0);
	node0.call(force.drag);
	anchorLink
	    .data(labelAnchorLinks)
	anchorNode = vis.selectAll("g.anchorNode")
	    .data(force2.nodes())
	anchorNode 
	    .enter().append("svg:g")
	    .attr("class", "anchorNode");
	anchorNode.append("svg:circle")
	    .attr("r", 0).style("fill",  function(d) {return d.node.color});
	anchorNode.append("svg:text")
	    .text(function(d, i) {
		console.log(d) 
		return i % 2 == 0 ? "" : d.node.label
	    })
	    .style("fill", function(d) {return (cpt %2) ? "transparent" : d.node.color})
	    .style("font-family", "Arial")
	    .style("font-size", 12);
	anchorNode.exit()


	tickEtTock =  function() {
	

	    force2.start();

	    node0.call(updateNode);
	    anchorNode.each(function(d, i) {
		
		if(i % 2 == 0) {
		    d.x = d.node.x;
		    d.y = d.node.y;
		} else {
		    var b = this.childNodes[1].getBBox();

		    var diffX = d.x - d.node.x;
		    var diffY = d.y - d.node.y;

		    var dist = Math.sqrt(diffX * diffX + diffY * diffY);

		    var shiftX = b.width * (diffX - dist) / (dist * 2);
		    shiftX = Math.max(-b.width, Math.min(0, shiftX));
		    var shiftY = 5;
		    this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
		}
	    });


	    anchorNode.call(updateNode);

	    link.call(updateLink);
	    anchorLink.call(updateLink);

	}

	console.log("done") ; 

    }

    function mousemove() {
	cursor.attr("transform", "translate(" + d3.mouse(this) + ")");
    }

    function mousedown() {
	id++;
	force.stop() ; 
	force2.stop()
	data.push( {"session":1,"id":id,"versions":[{"mid":"1.7","id":0,"timestamp":1358505193647,"authors":"John Doe","links":{},"metaData":{}, "content":"Hey there" +id}]})
	update(data) ;
    }

    var colors = []
    for (var i = 0 ; i < 30 ; i ++) colors.push ( "hsl(" + ~~(100/30*i) + ",100%, 20%)") ;
    colors = shuffle(colors) 

    update() ; 
//    update() ; //!WHAT I DONT KNOW BUT I NEED TWO 

    window.ttt= vis ; 


})
