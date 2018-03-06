
// TODO: : node returns array index as handle reference,
//but deletion does a splice, thus these indexes become
//outdated. Node hanlding should be differnet
ForceDirectedGrapher=function(){
  var thisGrapher=this;
  var width = window.innerWidth,
      height = window.innerHeight;

  var fill = d3.scale.category20();

  var force = d3.layout.force()
      .size([width, height])
      .nodes([]) // initialize with a single node
      .linkDistance(150)
      .charge(160)
      .on("tick", tick);

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
      links = force.links(),
      node = svg.selectAll(".node"),
      link = svg.selectAll(".link");

  var cursor = svg.append("circle")
      .attr("r", 30)
      .attr("transform", "translate(-100,-100)")
      .attr("class", "cursor");

  restart();

  function mousemove() {
    cursor.attr("transform", "translate(" + d3.mouse(this) + ")");
  }

  function mousedownCanvas() {
    // var point = d3.mouse(this),
    //     node = {x: point[0], y: point[1]},
    //     n = nodes.push(node);
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
  this.addLink=function(from,to){
    // console.log("ADDLINK",from,to);
    links.push({
      source: from,
      target: to
    });
    restart();
  }

  var Node=function(props){
    var props=props||{};
    // this.layoutNode=props;
    var self=this;
    var graphs=false;
    self.connectTo=function(to){
      thisGrapher.addLink(self,to);
    }
    self.tickFunction=function(evt){

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
  this.addNode=function(props){
    var node=new Node(props);
    var n = nodes.push(node);
    //TODO: Lazy stack, replacing the restart because many node/ link calls can be done in fast succession
    restart();
    return node;
  }
  this.removeNode=function(nodeReference){
    var d=nodeReference;
    var i=nodeReference.index;
    nodes.splice(i, 1);
    links = links.filter(function(l) {
      return l.source !== d && l.target !== d;
    });
  }
  this.nodeHighlight=function(handler){
    if(handler.grasa<20)
    handler.grasa+=2;
    // console.log(nodes[handler]);
  }
  this.rebuild=restart;
  function mousedownNode(d, i) {
    d.grasa=10;
    console.log(i,d);
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
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        // .attr("r", function(d) {
        //   if(!d.grasa) d.grasa=5;
        //   if(d.grasa>5)d.grasa--;
        //   return d.grasa;
        // });
    // console.log(node);
    node.each(function(node){
      node.tickFunction(evt);
    });
  }
  function animate(t){
    // console.log(evt);
    node.each(function(node){
      node.tickFunction({
        type:'clock',
        absTime:t
      });
    });
    node.attr("r", function(d) {
          if(!d.grasa) d.grasa=5;
          if(d.grasa>5)d.grasa--;
          return d.grasa;
        });
    requestAnimationFrame(animate);
  }
  animate();
  function restart() {
    node = node.data(nodes);

    node.enter().insert("circle", ".cursor")
      // .attr("class",function(d) { return "node "+d.grasa; })
        .attr("class","node")
        .attr("r", 5)
        .on("mousedown", mousedownNode);
    // console.log(node.enter());


    node.exit()
        .remove();


    link = link.data(links);

    force.nodes(nodes)
    .links(links)
    .linkDistance(80)
    .charge(-120/*function(d){
      if(d.grasa){
        return -60*d.grasa
      }else{
        return -60;
      }
    }/**/)
    .on("tick", tick);

    link.enter().insert("line", ".node")
        .attr("class", "link");
    link.exit()
        .remove();

    force.start();
  }
  return this;
};

module.exports=ForceDirectedGrapher;