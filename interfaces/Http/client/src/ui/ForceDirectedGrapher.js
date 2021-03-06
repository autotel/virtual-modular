//TODO. lazy stack of reconstructFunction
'use strict'

var forceSetting={}
forceSetting.linkDistance = 70;
forceSetting.linkStrength= 1;
forceSetting.charge = -1000;
forceSetting.chargeDistance= 900;

var ForceDirectedGrapher = function () {
  var thisGrapher = this;
  var width = window.innerWidth,
    height = window.innerHeight;

  var fill = d3.scale.category20();

  var force = d3.layout.force()
    .size([width, height])
    .nodes([]) // initialize with a single node
    // .linkDistance(3000)
    // .linkStrength(10)
    // .gravity(1)
    // .charge(4)
    // .chargeDistance(900)
    .on("tick", tick);
  console.log(force);

  var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("mousemove", mousemove)
    .on("mousedown", mousedownCanvas);
  // console.log("APPEND SVG",width,height);

  // svg.append("rect")
  //     .attr("width", width)
  //     .attr("height", height);

  var nodes = force.nodes(),
    links = force.links();

  var _node = svg.selectAll(".node"),
    _link = svg.selectAll(".link");

  var cursor = svg.append("circle")
    .attr("r", 30)
    .attr("transform", "translate(-100,-100)")
    .attr("class", "cursor");

  restart();

  function mousemove() {
    cursor.attr("transform", "translate(" + d3.mouse(this) + ")");
  }

  function mousedownCanvas() {
    var point = d3.mouse(this);
    // var node = {x: point[0], y: point[1]},
        // n = nodes.push(node);
    //
    // // add links to any nearby nodes
    // nodes.forEach(function(target) {
    //   var x = target.x - node.x,
    //       y = target.y - node.y;
    //   if (Math.sqrt(x * x + y * y) < 30) {
    //     links.push({source: node, target: target});
    //   }
    // });
    //
    // restart();
  }

  var Node = function (props) {
    var props = props || {};
    // this.layoutNode=props;
    var self = this;
    var graphs = false;

    for (var a in props) {
      self[a] = props[a];
    }

    var outputs = this.outputs = new Set();

    self.connectTo = function (to) {
      outputs.add(to);
      // thisGrapher.addLink(self,to);
      // console.log(outputs.size);
      restart();
    }
    self.disconnectTo = function (to) {
      outputs.delete(to);
      // console.log("disconnect",linkCache);
      // thisGrapher.setLinksTo(self,Array.from(linkCache));
      restart();
    }
    this.links = [];
    self.getLinkTo = function (to) {
      // console.log(to);
      for (var d of self.links) {
        if (d.target == to) return d;
      }
      return false;
      // return self.links[to];
    }
    self.tickFunction = function (evt) {

      // fail();
      // if(Math.random()>0.95){
      //   console.log("TIK",self);
      // }
      // graphs=svg.append("rect").
      //   attr("x", self.x).
      //   attr("y", self.y).
      //   attr("height", 100).
      //   attr("width", 200);
    }
    // self.reconstructFunction=function(svg){
    //     // console.log("RECO",e);
    //     svg.insert("circle", ".test")
    //       .attr("class","test")
    //       .attr("r", 15)
    //
    //       if(Math.random()>0.95){
    //         console.log("RECO");
    //       }
    // }
    // self.customDraw=function(data){
    //   console.log("CUSTOM",data);
    // }
  }
  this.addNode = function (props) {
    var node = new Node(props);
    var n = nodes.push(node);
    //TODO: Lazy stack, replacing the restart because many node/ link calls can be done in fast succession
    restart();
    return node;
  }
  this.getOrMakeNode = function (props, checkFn) {
    for (var a in nodes) {
      if (checkFn(nodes[a])) {
        return nodes[a];
      }
    }
    return thisGrapher.addNode(props);
  }
  this.removeNode = function (nodeReference) {
    var d = nodeReference;
    var i = nodes.indexOf(d);
    console.log("remove");
    if (i !== -1) {
      return nodes.splice(i, 1);
    } else {
      return false;
    }
  }
  this.nodeHighlight = function (handler) {
    if (handler.grasa < 20)
      handler.grasa += 2;
    // console.log(nodes[handler]);
  }
  this.rebuild = restart;
  function mousedownNode(d, i) {
    d.grasa = 10;
    console.log(i, d);
    //how on earth are node.id kept??
    // nodes.splice(i, 1);
    // links = links.filter(function(l) {
    //   return l.source !== d && l.target !== d;
    // });
    // d3.event.stopPropagation();

    restart();
    //console.log(nodes,links);
  }

  function tick(evt) {
    // console.log("TICL",evt);


    _link.attr("d", function (d) {
      var dx = d.target.x - d.source.x;
      var dy = d.target.y - d.source.y;
      var dr = Math.sqrt(dx * dx + dy * dy) * d.h / 2;
      return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + (-dr) + " 0 0,1 " + d.target.x + "," + d.target.y;
    });

    _node.attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; })
    // .attr("r", function(d) {
    //   if(!d.grasa) d.grasa=5;
    //   if(d.grasa>5)d.grasa--;
    //   return d.grasa;
    // });
    // console.log(node);

  }
  function animate(t) {
    // console.log(evt);
    requestAnimationFrame(animate);
    tick();
    _node.each(function (node) {
      node.tickFunction({
        type: 'clock',
        absTime: t
      });
    });
    _node.attr("r", function (d) {
      if (!d.grasa) d.grasa = 5;
      if (d.grasa > 5) d.grasa--;
      return d.grasa;
    });

    // _node.each(function(node){
    //   node.tickFunction(t);
    // });
    _link.each(function (link) {
      link.tickFunction({
        type: 'clock',
        absTime: t
      });
    }).style("stroke-width", function (d) {
      return (1 + d.h) / 4;
    })/*.style("stroke-dashoffset",function(d){return d.off + "%"})*/;

    // requestAnimationFrame(
  }

  animate();

  function restart() {
    _node = _node.data(nodes);

    _node.enter().insert("circle", ".cursor")
      .attr("class", "node")
      .attr("r", 5)
      .on("mousedown", mousedownNode);


    _node.exit()
      .remove();

    
    var links = [];
    for (var node of nodes) {
      node.links = [];
      for (var output of node.outputs) {
        var newLink = new (function () {
          var self = this;
          this.source = node;
          this.target = output;
          this.h = 0;
          this.off = 0;
          this.highlight = function () {
            self.h = 5;
            // self.off--;
            // if (self.off <= 0) {
            //   self.off = 100;
            // }
          };
          this.tickFunction = function () {
            if (self.h > 0) {
              self.h--;
            }
          }
        })();
        links.push(newLink);
        node.links.push(newLink);
      }
    }

    _link = _link.data(links);
   
    force.nodes(nodes)
      .links(links)
      .linkDistance(forceSetting.linkDistance)
      .linkStrength(forceSetting.linkStrength)
      .charge(forceSetting.charge)
      .chargeDistance(forceSetting.chargeDistance)
      // .on("tick", tick);


    //https://stackoverflow.com/questions/18164230/add-text-label-to-d3-node-in-force-directed-graph-and-resize-on-hover
    _link.enter().insert("path", ".node")//"line"
      .attr("class", "link");
    _link.exit()
      .remove();

    force.start();
  }
  return this;
};

module.exports = ForceDirectedGrapher;