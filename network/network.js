
var graphsvg = d3.select('#graphsvg');
var graphwidth = +graphsvg.attr('width');
var graphheight = +graphsvg.attr('height');

var NetworkcolorScale = d3.scaleOrdinal(d3.schemeTableau10);
var NetworklinkScale = d3.scaleLinear()
    .domain([10, 8000])
    .range([5,15]);

var simulation = d3.forceSimulation()
                    .force('link', d3.forceLink())
                    .force('charge', d3.forceManyBody().strength(-850))
                    .force('center', d3.forceCenter(graphwidth / 2, graphheight / 2));


var linkEnter = [];
var nodes = [];
var selected = [];
var selectedVal = "";  //initialized as ""
var slidernum = 0;  //following the number of slider change
var networkcategory = []
var graphweight = "weight";   //default is for popularity

//var popularitySliderElement = document.getElementById('slider-popularity');
var gpopularity = d3.select('svg#slider-popularity')
                    .attr('width',400)
                    .attr('height',300)
                    .attr('transform','translate(1020,-900)')
  //                  .append('g')
                   

function onSliderChanged()
{
    var select = d3.select("#SliderSelect").node();
    networkcategory = select.options[select.selectedIndex].value;
    //update the chart with the selected category of graph
    if(networkcategory =="winningrate")
    {
        graphweight = "winweight";
    }
    else
    {
        graphweight = "weight";
    }
    NetWorkupdateChart(networkcategory);
}

var popularitySlider = d3.sliderHorizontal()
                         .min(10).max(8000)   //although max is more than 12000, 8000 is enough to perform as a maximum threshold
                         .width(300)
                         .fill('black')
                         .displayValue(true)
                         .ticks(10)
                         .value(50)
                         .displayFormat(d3.format('.0f'))
                         .on('onchange', num => {
                            slidernum = num;
					    	linkEnter.style("stroke", function (o) {           
                             var a = false;
                            if(selectedVal !="")
                            {

                            selected.each(function(d) { if(d.index == o.source.index | d.index == o.target.index) {a= true;}  });
                            if(networkcategory=="winningrate"){
                            return a ? 'green' : '#aaa';
                        }
                        else{
                            return a ? 'red' : '#aaa';
                        }
                           }
                            else
                           {
                               return  0.05;
                           }
                        }).style('stroke-opacity',function (o) {
                             var a = false;
                            if(selectedVal !="")
                            {
                             selected.each(function(d) { if(d.index == o.source.index | d.index == o.target.index) {a= true;}  });
                             return a & o.weight>num?  0.1 : 0;
                            }
                            else
                            {
                                return o.weight >num?0.1:0;
                            }
                        });
                    });


gpopularity.append('g').attr('transform','translate(30,60)')
           .call(popularitySlider);

//gpopularity.append('text')    //add title for the slider
//            .text("Popularity Slider")
//            .attr('font-size',30)
//            .attr('font-weight',10)
//            .attr('transform','translate(20,30)')


//process the search bar
var searchbar = d3.select('#searchgroup')
                  .attr('transform','translate(20, 20)');
//console.log(searchbar)

d3.json('network/network-data.json').then(function(dataset){
    
    network = dataset;
    // data processing
    var linkG = graphsvg.append('g')
                   .attr('class','link-group')

    //use weight for link stroke width if possible
    linkEnter = linkG.selectAll('.link')
                     .data(network.links)
                     .enter().append('line')
                      .attr('class','link');

    var nodeG = graphsvg.append('g')
                   .attr('class','node-group');

    nodes = nodeG.selectAll("g")
                .data(network.nodes)
                .enter().append("g")
                .attr("class","networknode") 

    NetWorkupdateChart("popularity");
})
.catch(function(error){
    //console.log(error.id)
    throw error;
})


function NetWorkupdateChart(filterKey)
{


if(filterKey =="winningrate") 
{
        slidernum = -0.2;
        popularitySlider.min(-0.2).max(0.15).ticks(10).tickFormat(d3.format('.1%')).displayFormat(d3.format('.0%')).value(-0.2).silentValue(-0.2); 
        selectedVal = "";  //back to null

}
else
{
      popularitySlider.min(10).max(8000).ticks(10).tickFormat(d3.format('.0f')).displayFormat(d3.format('.0f')).value(10).silentValue(10);  
      slidernum = 10;
      selectedVal = "";  //back to null
}


nodes.on('mouseenter', hiddenNodes)
     .on('mouseleave', showNodes);


//change the slider values acoording to the category change as well
//console.log('here',graphweight)
popularitySlider.on('onchange', num => {
                            slidernum = num;
                            linkEnter.style("stroke", function (o) {           
                             var a = false;
                            if(selectedVal !="")
                            {

                            selected.each(function(d) { if(d.index == o.source.index | d.index == o.target.index) {a= true;}  });
                            if(networkcategory=="winningrate"){
                            return a ? 'green' : '#aaa';
                             }
                           else{
                            return a ? 'red' : '#aaa';
                          }
                           }
                            else
                           {
                               return  0.1;
                           }
                        }).style('stroke-opacity',function (o) {
                             var a = false;
                             
                            if(selectedVal !="")
                            {
                             selected.each(function(d) { if(d.index == o.source.index | d.index == o.target.index) {a= true;}  });
                             return a & o[graphweight]>num?  0.1 : 0;
                            }
                            else
                            {
                                //console.log(o[graphweight]);
                                return o[graphweight]>num?  0.1 : 0; 
                            }
                        })
                        //.attr('stroke-width',function(d){ return NetworklinkScale(d[graphweight]) } );   // more wide, more weight
                        });
                         

    
gpopularity.call(popularitySlider);    //update  
function hiddenNodes(d,index) {

        linkEnter.style("stroke", function (o) {           
            if(networkcategory=="winningrate"){
                return index.index ==o.source.index | index.index==o.target.index ? 'green' : '#aaa';
            }
            else{
                return index.index ==o.source.index | index.index==o.target.index ? 'red' : '#aaa';
            }
        }).style('stroke-opacity',function (o) {
            return index.index==o.source.index | index.index==o.target.index ? (o[graphweight]>slidernum?  0.1 : 0): 0;
        })
        //.attr('stroke-width',function(d){ return NetworklinkScale(d[graphweight]) } );   // more wide, more weight
    
}

function showNodes(d,index){

        linkEnter.style("stroke", '#aaa').style('stroke-opacity',function(o)
            {
                return o[graphweight]>slidernum?  0.1 : 0;
            });
            }

    var circles = nodes.append('circle')
                         .attr('class','circle')
                         .attr('r',6)
                         .style('fill','#f00')
                         .attr('id','circlenode')

    var labels = nodes.append("text")
                     .text(function(d) {
                     return d.id;
                         })
                     .attr('x', -10)
                     .attr('y', 18)
                     .attr('font-size',10)
                     .attr('font-weight',10);

    nodes.append("title")
      .text(function(d) { return d.id; });
    // link to the force simulation 

    simulation
        .nodes(network.nodes)
        .force('link',
          d3.forceLink(network.links).id(function(d)
          {
            return d.index;
          })
          .distance(100)
        )
        .on('tick',tickSimulation);  //redraw the nodes and links when updating the force-layout


    function tickSimulation(){
        linkEnter
            .attr('x1', function(d) { return d.source.x;})
            .attr('y1', function(d) { return d.source.y;})
            .attr('x2', function(d) { return d.target.x;})
            .attr('y2', function(d) { return d.target.y;});


        nodes
            .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
            })
            //.attr('cx',function(d){return d.x;})
            //.attr('cy',function(d){return d.y;})
            //.attr('fx',function(d){return d.x})
            //.attr('fy',function(d){return d.y});

     }

     if(selectedVal==="")
     {
        
        selected = nodes.filter(function(d)  //reaturn all
        {
            return d;
        })
     }

}

 function searchNetworkNode() {

      //find the node
      selectedVal = document.getElementById('search').value;
      var node = graphsvg.selectAll(".networknode");
      //console.log("Selected Val: ",selectedVal);
      //console.log(node.size())
      if (selectedVal == "") {
        //node.style("stroke", "#aaa").style("stroke-width", "0.1");
        //node.style("opacity",0.1);
        linkEnter.style("stroke", '#aaa').style('stroke-opacity',function(o)
          {
             return o[graphweight]>slidernum? 0.1 :0;
          });


      } else {
        selected = node.filter(function (d) {
            return d.id == selectedVal;
        });
         var unselected = node.filter(function (d) {
            return d.id != selectedVal;
        });

        linkEnter.style("stroke", function (o) {           

             var a = false;
             selected.each(function(d) { 
               if(d.index == o.source.index | d.index == o.target.index) {a= true;};  });
            if(networkcategory=="winningrate"){
            return a ? 'green' : 0.1;
         }
        else{ 
             //if(a==true) console.log("here");
            return a ? 'red' : 0.1;
        }
        }).style('stroke-opacity',function (o) {
             var a = false;
             selected.each(function(d) { if(d.index == o.source.index | d.index == o.target.index) {a= true;}  });
             return a ? 0.1 : 0;
        });
        
      }
}





