
var svg = d3.select('svg');
var width = +svg.attr('width');
var height = +svg.attr('height');

var colorScale = d3.scaleOrdinal(d3.schemeTableau10);
var linkScale = d3.scaleLinear()
    .domain([10, 8000])
    .range([3,15]);

var simulation = d3.forceSimulation()
                    .force('link', d3.forceLink())
                    .force('charge', d3.forceManyBody().strength(-850))
                    .force('center', d3.forceCenter(width / 2, height / 2));


var linkEnter = [];
var nodes = [];
var selected = [];
var selectedVal = "";  //initialized as ""
var slidernum = 0;  //following the number of slider change

//var popularitySliderElement = document.getElementById('slider-popularity');
var gpopularity = d3.select('svg#slider-popularity')
                    .attr('width',400)
                    .attr('height',300)
                    .attr('transform','translate(1020,-1000)')
  //                  .append('g')
                   

function onCategoryChanged()
{
    var select = d3.select("#categorySelect").node();
    var category = select.options[select.selectedIndex].value;
    //update the chart with the selected category of graph
    updateChart(category);
}

var popularitySlider = d3.sliderHorizontal()
                         .min(10).max(8000)   //although max is more than 12000, 8000 is enough to perform as a maximum threshold
                         .width(300)
                         .fill('black')
                         .displayValue(true)
                         .ticks(10)
                         .on('onchange', num => {
                            slidernum = num;
					    	linkEnter.style("stroke", function (o) {           
                             var a = false;
                            if(selectedVal !="")
                            {

                            selected.each(function(d) { if(d.index == o.source.index | d.index == o.target.index) {a= true;}  });
                            return a ? 'green' : '#aaa';
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

d3.json('merged.json').then(function(dataset){
    
    network = dataset;
    // data processing
    var linkG = svg.append('g')
                   .attr('class','link-group')

    //use weight for link stroke width if possible
    linkEnter = linkG.selectAll('.link')
                         .data(network.links)
                         .enter()
                         .append('line')
                         .attr('class','link')
                         .attr('stroke-width',function(d){ return linkScale(d.weight) } );   // more wide, more weight

    var nodeG = svg.append('g')
                   .attr('class','node-group');

    nodes = nodeG.selectAll("g")
                .data(network.nodes)
                .enter().append("g")
                .attr("class","node")

    updateChart("popularity");
})
.catch(function(error){
    //console.log(error.id)
    throw error;
})


function updateChart(filterKey)
{

var graphweight = "weight";
if(filterKey =="winningrate") 
    {
        graphweight = "winweight";
        popularitySlider.min(-0.2).max(0.15).ticks(10).tickFormat(d3.format('.1%')).default(-0.02);

    }
else
{
     popularitySlider.min(10).max(8000).ticks(10).tickFormat(d3.format(',.0f')).default(50);  
}


nodes.on('mouseenter', hiddenNodes)
     .on('mouseleave', showNodes);


//change the slider values acoording to the category change as well
gpopularity.call(popularitySlider);    //update    
popularitySlider.on('onchange', num => {
                            slidernum = num;
                            linkEnter.style("stroke", function (o) {           
                             var a = false;
                            if(selectedVal !="")
                            {

                            selected.each(function(d) { if(d.index == o.source.index | d.index == o.target.index) {a= true;}  });
                            return a ? 'green' : '#aaa';
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
                                return o[graphweight] >num?0.1:0;
                            }
                        });
                        });

    

function hiddenNodes(d,index) {

        linkEnter.style("stroke", function (o) {           
            return index.index ==o.source.index | index.index==o.target.index ? 'green' : '#aaa';
        }).style('stroke-opacity',function (o) {
            return index.index==o.source.index | index.index==o.target.index ? (o[graphweight]>slidernum?  0.1 : 0): 0;
        });
    
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
    var cnt= 0;
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

 function searchNode() {

      //find the node
      selectedVal = document.getElementById('search').value;
      var node = svg.selectAll(".node");

      //console.log(node.size())

      if (selectedVal == "") {
        // node.style("stroke", "#aaa").style("stroke-width", "0.1");
        // node.style("opacity",0.1);
        // linkEnter.style("stroke", '#aaa').style('stroke-opacity',0.1);
        // selected = []
      } else {
        // console.log(node);
        selected = node.filter(function (d) {
            return d.id == selectedVal;
        });
         var unselected = node.filter(function (d) {
            return d.id != selectedVal;
        });


        linkEnter.style("stroke", function (o) {           
             //console.log('index: ',index);
             //console.log('source index: ',o.source.index);
             var a = false;
             selected.each(function(d) { if(d.index == o.source.index | d.index == o.target.index) {a= true;}  });
            return a ? 'green' : 0.1;
        }).style('stroke-opacity',function (o) {
             var a = false;
             selected.each(function(d) { if(d.index == o.source.index | d.index == o.target.index) {a= true;}  });
             return a ? 0.1 : 0;
        });
        
      }
}

/*  later for the popularity
// team_id is not very useful for us I think ->  id decides the sequence of hero choosing
function dataProcessor(row)
{
    return {
        'match_id': row['match_id'],   // no need for numerical
        'radiant_win': row['radiant_win'],
        '1is_pick': row['1is_pick'],
        '1team_id':  +row['1team_id'],
        '1hero_id': +row['1hero_id'],
        '2is_pick': row['2is_pick'],
        '2team_id':  +row['2team_id'],
        '2hero_id': +row['2hero_id'],
        '3is_pick': row['3is_pick'],
        '3team_id':  +row['3team_id'],
        '3hero_id': +row['3hero_id'],
        '4is_pick': row['4is_pick'],
        '4team_id':  +row['4team_id'],
        '4hero_id': +row['4hero_id'],
        '5is_pick': row['5is_pick'],
        '5team_id':  +row['5team_id'],
        '5hero_id': +row['5hero_id'],
        '6is_pick': row['6is_pick'],
        '6team_id':  +row['6team_id'],
        '6hero_id': +row['6hero_id'],
        '7is_pick': row['7is_pick'],
        '7team_id':  +row['7team_id'],
        '7hero_id': +row['7hero_id'],
        '8is_pick': row['8is_pick'],
        '8team_id':  +row['8team_id'],
        '8hero_id': +row['8hero_id'],
        '9is_pick': row['9is_pick'],
        '9team_id':  +row['9team_id'],
        '9hero_id': +row['9hero_id'],
        '10is_pick': row['10is_pick'],
        '10team_id':  +row['10team_id'],
        '10hero_id': +row['10hero_id'],
        '11is_pick': row['11is_pick'],
        '11team_id':  +row['11team_id'],
        '11hero_id': +row['11hero_id'],
        '12is_pick': row['12is_pick'],
        '12team_id':  +row['12team_id'],
        '12hero_id': +row['12hero_id'],
        '13is_pick': row['13is_pick'],
        '13team_id':  +row['13team_id'],
        '13hero_id': +row['13hero_id'],
        '14is_pick': row['14is_pick'],
        '14team_id':  +row['14team_id'],
        '14hero_id': +row['14hero_id'],
        '15is_pick': row['15is_pick'],
        '15team_id':  +row['15team_id'],
        '15hero_id': +row['15hero_id'],
        '16is_pick': row['16is_pick'],
        '16team_id':  +row['16team_id'],
        '16hero_id': +row['16hero_id'],
        '17is_pick': row['17is_pick'],
        '17team_id':  +row['17team_id'],
        '17hero_id': +row['17hero_id'],
        '18is_pick': row['18is_pick'],
        '18team_id':  +row['18team_id'],
        '18hero_id': +row['18hero_id'],
        '19is_pick': row['19is_pick'],
        '19team_id':  +row['19team_id'],
        '19hero_id': +row['19hero_id'],
        '20is_pick': row['20is_pick'],
        '20team_id':  +row['20team_id'],
        '20hero_id': +row['20hero_id']   
    }
}


//predefined global data
var gamedata = {}
// convert to the banned ones and not banned ones
var banneddata = {}
var chosendata = {}
d3.csv('capmodedata.csv',dataProcessor).then(function(dataset) {
        
        banneddata = dataset.map(function(d)
        {
            return {
        'match_id': d['match_id'],   // no need for numerical
        'radiant_win': d['radiant_win'],
        '1is_pick': d['1is_pick'],
        '1team_id':  d['1team_id'],
        '1hero_id': d['1hero_id'],
        '2is_pick': d['2is_pick'],
        '2team_id':  d['2team_id'],
        '2hero_id': d['2hero_id'],
        '3is_pick': d['3is_pick'],
        '3team_id':  d['3team_id'],
        '3hero_id': d['3hero_id'],
        '4is_pick': d['4is_pick'],
        '4team_id':  d['4team_id'],
        '4hero_id': d['4hero_id'],
        '9is_pick': d['9is_pick'],
        '9team_id':  d['9team_id'],
        '9hero_id': d['9hero_id'],
        '10is_pick': d['10is_pick'],
        '10team_id':  d['10team_id'],
        '10hero_id': d['10hero_id'],
        '11is_pick': d['11is_pick'],
        '11team_id':  d['11team_id'],
        '11hero_id': d['11hero_id'],
        '12is_pick': d['12is_pick'],
        '12team_id': d['12team_id'],
        '12hero_id': d['12hero_id'],
        '17is_pick': d['17is_pick'],
        '17team_id':  d['17team_id'],
        '17hero_id':  d['17hero_id'],
        '18is_pick': d['18is_pick'],
        '18team_id': d['18team_id'],
        '18hero_id': d['18hero_id']
            }
        });

        chosendata = dataset.map(function(d)
        {
            return {
        'match_id': d['match_id'],   // no need for numerical
        'radiant_win': d['radiant_win'],
        '5is_pick': d['5is_pick'],
        '5team_id':  d['5team_id'],
        '5hero_id': d['5hero_id'],
        '6is_pick': d['6is_pick'],
        '6team_id': d['6team_id'],
        '6hero_id': d['6hero_id'],
        '7is_pick': d['7is_pick'],
        '7team_id': d['7team_id'],
        '7hero_id': d['7hero_id'],
        '8is_pick':  d['8is_pick'],
        '8team_id':  d['8team_id'],
        '8hero_id':  d['8hero_id'],
        '13is_pick': d['13is_pick'],
        '13team_id': d['13team_id'],
        '13hero_id': d['13hero_id'],
        '14is_pick': d['14is_pick'],
        '14team_id': d['14team_id'],
        '14hero_id': d['14hero_id'],
        '15is_pick': d['15is_pick'],
        '15team_id': d['15team_id'],
        '15hero_id': d['15hero_id'],
        '16is_pick': d['16is_pick'],
        '16team_id': d['16team_id'],
        '16hero_id': d['16hero_id'],
        '19is_pick': d['19is_pick'],
        '19team_id': d['19team_id'],
        '19hero_id': d['19hero_id'],
        '20is_pick': d['20is_pick'],
        '20team_id': d['20team_id'],
        '20hero_id': d['20hero_id']  
        }
        });

        // turn the false hero_id -> 0 null
        //bannedheros = gamedata.slice(0,3,1);
        //console.log(dataset.length);
        //console.log(chosendata.length);

});
*/



