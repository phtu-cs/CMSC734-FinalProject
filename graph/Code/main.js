
var svg = d3.select('svg');
var width = +svg.attr('width');
var height = +svg.attr('height');

var colorScale = d3.scaleOrdinal(d3.schemeTableau10);
var linkScale = d3.scaleLinear()
    .domain([10, 12000])
    .range([1, 50]);

var simulation = d3.forceSimulation()
                    .force('link', d3.forceLink())
                    .force('charge', d3.forceManyBody().strength(-850))
                    .force('center', d3.forceCenter(width / 2, height / 2));


var linkEnter;
var selected;

//var popularitySliderElement = document.getElementById('slider-popularity');
var gpopularity = d3.select('div#slider-popularity')
                    .append('svg')
                    .attr('width',375)
                    .attr('height',300)
                    .append('g')
                    //.attr('transform','translate(0,1100)')

var popularitySlider = d3.sliderHorizontal()
                         .min(0).max(12000)
                         .step(1)
                         .width(300)
                         .fill('black')
                         .displayValue(false)
                         .ticks(0)
                          .on('onchange', num => {
					    		linkEnter.style("stroke", function (o) {           
                             var a = false;
                             selected.each(function(d) { if(d.index == o.source.index | d.index == o.target.index) {a= true;}  });
                            return a ? 'green' : 0.1;
                        }).style('stroke-opacity',function (o) {
                             var a = false;
                             selected.each(function(d) { if(d.index == o.source.index | d.index == o.target.index) {a= true;}  });
                             return a & o.weight>num?  1 : 0;
                        });
                    });


gpopularity.append('g').attr('transform','translate(30,60)')
           .call(popularitySlider);

d3.json('popularitygraph.json').then(function(dataset){
    
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
                         .attr('stroke-width',function(d){ return linkScale(d.weight) } );

    var nodeG = svg.append('g')
                   .attr('class','node-group');

    var nodes = nodeG.selectAll("g")
                .data(network.nodes)
                .enter().append("g")
                .attr("class","node")
                .on('mouseenter', hiddenNodes)
                .on('mouseleave', showNodes)

    var toggle = 0;
    var linkedByIndex;
    //This function looks up whether a pair are neighbours
    // function neighboring(a, b) {
    //   return linkedByIndex[a.index + "," + b.index];
    // }
    function hiddenNodes(d,index) {

        linkEnter.style("stroke", function (o) {           
             //console.log('index: ',index);
             //console.log('source index: ',o.source.index);
            return index.index ==o.source.index | index.index==o.target.index ? 'green' : 0.1;
        }).style('stroke-opacity',function (o) {
            return index.index==o.source.index | index.index==o.target.index ? 1 : 0;
        });

    
    }
    function showNodes(d,index){

        linkEnter.style("stroke", '#aaa').style('stroke-opacity',0.1);

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
        .nodes(dataset.nodes)
        .force('link',
          d3.forceLink(dataset.links).id(function(d)
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
    //simulation.alphaTarget(0);
    //circles.call(drag);   //call the drag event on circle node objects
    //simulation.stop();

})
.catch(function(error){
    //console.log(error.id)
    throw error;
})


 function searchNode() {
      //find the node
      var selectedVal = document.getElementById('search').value;
      var node = svg.selectAll(".node");

      console.log(node.size())

      if (selectedVal == "") {
        node.style("stroke", "#aaa").style("stroke-width", "1");
        node.style("opacity",1);
        linkEnter.style("stroke", '#aaa').style('stroke-opacity',0.1);
        selected = []
      } else {
        // console.log(node);
        selected = node.filter(function (d) {
            return d.id == selectedVal;
        });
         var unselected = node.filter(function (d) {
            return d.id != selectedVal;
        });

        // console.log(selected.index);
        // console.log("Doom"==selectedVal)
        // unselected.style("opacity", 0);


        linkEnter.style("stroke", function (o) {           
             //console.log('index: ',index);
             //console.log('source index: ',o.source.index);
             var a = false;
             selected.each(function(d) { if(d.index == o.source.index | d.index == o.target.index) {a= true;}  });
            return a ? 'green' : 0.1;
        }).style('stroke-opacity',function (o) {
             var a = false;
             selected.each(function(d) { if(d.index == o.source.index | d.index == o.target.index) {a= true;}  });
             return a ? 1 : 0;
        });
        

        // var link = svg.selectAll(".link")
        // link.style("opacity", "0");
        // d3.selectAll(".node, .link").transition()
        //     .duration(5000)
        //     .style("opacity", 1);
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



