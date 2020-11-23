var svg = d3.select('svg');
var width = +svg.attr('width');
var height = +svg.attr('height');

var colorScale = d3.scaleOrdinal(d3.schemeTableau10);
var linkScale = d3.scaleSqrt().range([1,5]);

//var drag = d3.drag()
//			 .on('start',dragstarted)
//			 .on('drag',dragged)
//			 .on('end',dragended)

var tooltip = d3.select('body')
     			.append('div')
     			.style('position','absolute')
     			.style('visibility','visible')
     			.text("Circle Chosen")
     			.style('fontsize',3);


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
        console.log(dataset.length);
        console.log(chosendata.length);

});

