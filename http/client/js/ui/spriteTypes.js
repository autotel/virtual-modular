var test=0;
var getMultiNodeSpriteBase=function(forceDirectedGrapher,spriteBase){
  return function(props){
    var nodeList=[];
    spriteBase.call(this,props);
    nodeList.push(forceDirectedGrapher.addNode({type:props.type,name:props.name,color:"crimson"}));
    var thisSprite=this;
    var centerNode=nodeList[0];

    this.remove=function(){
      for(var a in this.nodeList){
        forceDirectedGrapher.removeNode(a);
      }
      forceDirectedGrapher.rebuild();
    }
    this.getNodeHandle=function(){
      return centerNode;
    }
    this.representEvent=function(event){
      if(test<10){
        console.log("rep,",event);
        test++;
      }
      if(event.sub!==undefined){
        // console.log("sub",event.sub);
        if(nodeList[event.sub+1])
        forceDirectedGrapher.nodeHighlight(nodeList[event.sub+1]);
      }else{
        // console.log("nosub",event);
      }
      forceDirectedGrapher.nodeHighlight(centerNode);
    }
    this.applyProperties=function(props){
      /*
      CHANGE Object {
      subnodes: 11,
      subnodeDestinations: Array[11],
      unique: 5 }
      */
      if(props.subnodes){
        //minus 1 because the center node is also in the list
        var noDelta=props.subnodes-nodeList.length+1;
        // console.log(props.subnodes+"-"+(nodeList.length+1)+"="+noDelta);
        if(noDelta>0){
          for(var a=0; a<noDelta; a++){
            var nNodeHandle=forceDirectedGrapher.addNode();
            nodeList.push(nNodeHandle);
            forceDirectedGrapher.addLink(centerNode,nNodeHandle);
          }
          forceDirectedGrapher.rebuild();
        }else if(noDelta<0){
          for(var a=0; a>noDelta; a--){
            forceDirectedGrapher.removeNode(nodeList.pop(nNodeHandle));
          }
          forceDirectedGrapher.rebuild();
        }
      }
      if(props.subnodeDestinations){
        var snD=props.subnodeDestinations;
        for(var a in snD){
          var subNodeHandle=nodeList[parseInt(a)+1];
          // console.log(a+1);
          var nodeHandleDestinations=[];
          //get the link handles for the node destinations that come in names
          //sequencers throw 2d arrays whilst kits 1d arrays. perhaps different in the future
          if(snD[a]){
            if(snD[a].constructor === Array){
              for(var b in snD[a]){
                var targetSprite=Ui.spriteFromNames[snD[a][b]];
                // console.log(targetSprite);
                if(snD[a][b]!==null){
                  nodeHandleDestinations.push(targetSprite.getNodeHandle());
                  console.log(targetSprite.getNodeHandle());}
              }
              console.log(subNodeHandle,nodeHandleDestinations);
              forceDirectedGrapher.setLinksTo(subNodeHandle,nodeHandleDestinations);
            }else{
              var targetSprite=Ui.spriteFromNames[snD[a]];
              if(targetSprite&&subNodeHandle){
                forceDirectedGrapher.setLinksTo(subNodeHandle,[targetSprite.getNodeHandle()]);
              }else{
                console.log(targetSprite,subNodeHandle);
              }
            }
          }else if(snD[a]===null){
            forceDirectedGrapher.setLinksTo(subNodeHandle,[]);
          }
        }
        forceDirectedGrapher.rebuild();
      }
    }
    // TODO: : I put this timeout because if some node didnt exist yet, creating a link
    //would take the forceDirectedGrapher down. Timeouts are not the way but I have no time now
    setTimeout(function(){
      thisSprite.applyProperties(props);
    },800);
  }
}

var singleNodeMultiDestinationSprite=function(forceDirectedGrapher,spriteBase){
  return function(props){
    var myNode=false;
    spriteBase.call(this,props);
    myNode=(forceDirectedGrapher.addNode({type:props.type,name:props.name,color:"crimson"}));
    var thisSprite=this;
    var targetSprites=[];

    this.remove=function(){
      forceDirectedGrapher.removeNode(myNode);
      forceDirectedGrapher.rebuild();
    }
    this.getNodeHandle=function(){
      return myNode;
    }
    this.representEvent=function(event){
      forceDirectedGrapher.nodeHighlight(myNode);
    }
    this.applyProperties=function(props){
      if(props.nodeDestinations){
        var snD=props.nodeDestinations;
        // console.log(":");
        for(var a in snD){
          // console.log(snD[a]);
          if(snD[a]!==null)
          targetSprites.push(Ui.spriteFromNames[snD[a]].getNodeHandle());
        }
        forceDirectedGrapher.setLinksTo(myNode,targetSprites);
        forceDirectedGrapher.rebuild();
      }
    }
    // TODO: : I put this timeout because if some node didnt exist yet, creating a link
    //would take the forceDirectedGrapher down. Timeouts are not the way but I have no time now
    setTimeout(function(){
      thisSprite.applyProperties(props);
    },200);
  }
}

Ui.addSpriteType("presetKit",function(forceDirectedGrapher,spriteBase){
  return getMultiNodeSpriteBase(forceDirectedGrapher,spriteBase);
});

Ui.addSpriteType("chordKit",function(forceDirectedGrapher,spriteBase){
  return getMultiNodeSpriteBase(forceDirectedGrapher,spriteBase);
});

Ui.addSpriteType("sequencer",function(forceDirectedGrapher,spriteBase){
  return getMultiNodeSpriteBase(forceDirectedGrapher,spriteBase);
});

Ui.addSpriteType("clock",function(forceDirectedGrapher,spriteBase){
  return getMultiNodeSpriteBase(forceDirectedGrapher,spriteBase);
});

Ui.addSpriteType("bus",function(forceDirectedGrapher,spriteBase){
  return singleNodeMultiDestinationSprite(forceDirectedGrapher,spriteBase);
});