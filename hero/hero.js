// Global function called when select element is changed
function onHeroCategoryChanged(value) {
    var select = d3.select('#HerocategorySelect').node();
    // Get current value of select element
    filterKey = select.options[select.selectedIndex].value;
    // Update chart with the selected category of letters
    updateHeroChart();
}

function onRangeChanged() {
    var select = d3.select('#rangeSelect').node();
    // Get current value of select element, save to global chartScales
    range = select.options[select.selectedIndex].value;
    // Update chart
    updateHeroChart();
}

// Load data and use this function to process each row
function dataPreprocessor(row) {
    return {
        hero_id: row.hero_id,
        hero_name: row.hero_name,
        num_win: +row.num_win,
        num_lose: +row.num_lose,
        winrate: +row.winrate
    };
}

d3.selectAll('.filter')
    .on('click', function(){
        // Remove the currently selected classname from that element
        d3.select('.filter.selected').classed('selected', false);
        var clicked = d3.select(this);
        // Add the selected classname to element that was just clicked
        clicked.classed('selected', true);
        updateHeroChart(clicked.attr('value'));
    });

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 90, r: 40, b: 140, l: 60};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = (svgHeight - padding.t - padding.b) / 2;

// Compute the spacing for bar bands based on all 26 letters
var barBand = chartWidth / 120;
var barHeight = barBand * 0.7;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

// A map with arrays for each category of letter sets
var lettersMap = {
    'all-letters': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    'only-consonants': 'BCDFGHJKLMNPQRSTVWXZ'.split(''),
    'only-vowels': 'AEIOUY'.split('')
};

d3.csv('winlose_indi.csv', dataPreprocessor).then(function(dataset) {
//		console.log(dataset)
        letters = dataset;

        // Set up the variables and functions that we need for our bar chart
        var maxNumWin = d3.max(dataset, function(d){
            return d.num_win;
        });
        var maxNumLose = d3.max(dataset, function(d){
            return d.num_lose;
        });
        maxNum = d3.max([maxNumWin, maxNumLose]);
        var nameHeroes = letters.map(function(d) {
			return d.hero_name;
		});
		var tickNameHeroes = letters.map(function(d,i) {
			return (i + 1) * barBand;
		});
        

        yScaleWin = d3.scaleLinear()
            .domain([maxNum, 0])
            .range([0, chartHeight]);
        yScaleLose = d3.scaleLinear()
            .domain([0, maxNum])
            .range([0, chartHeight]);
        yScaleRate = d3.scaleLinear()
            .domain([52, 48])
            .range([-chartHeight, chartHeight]);
        var xScaleHero = d3.scaleOrdinal()
			.domain(nameHeroes)
			.range(tickNameHeroes);
        
        
        colorScaleWin = d3.scaleSequential(d3.interpolateBlues)
			.domain([maxNum, 0]);
		colorScaleLose = d3.scaleSequential(d3.interpolateReds)
			.domain([0, maxNum]);

        svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'translate('+[svgWidth / 2+20, 60]+')')
            .text('Number of Win and Win Rate vs Hero')
            .style('fill','Gray')
            .style('font-size','20px');

        // Add axes here, if you put them in the updateHeroChart method, multiple axes will be added
        // We'll go over how to update axes with interaction in the next labs
        svg.append('g')
            .attr('class', 'axisWin')
            .attr('transform', 'translate('+[padding.l, padding.t]+')')
            .call(d3.axisLeft(yScaleWin).ticks(6));
        svg.append('g')
            .attr('class', 'axisLose')
            .attr('transform', 'translate('+[padding.l, padding.t + chartHeight]+')')
            .call(d3.axisLeft(yScaleLose).ticks(6));
        svg.append('g')
            .attr('class', 'axisRate')
            .attr('transform', 'translate('+[svgWidth - padding.r - 50, padding.t + chartHeight]+')')
            .call(d3.axisRight(yScaleRate).ticks(12));
        svg.append('g') // enter
			.attr('id', 'axisHero')
			.attr('transform', 'translate('+[padding.l, svgHeight - padding.b + 20]+')')
			.call(d3.axisBottom(xScaleHero))
			.selectAll('text')
				.style('text-anchor', 'end')
				.attr('transform', 'rotate(-65)')
				.attr('dx', '-1em')
				.attr('dy', '.15em');

        
        filterKey = 'default';
        range = 'default';
        
        updateHeroChart();
    });


function updateHeroChart() {
/*
    var filteredLetters = letters.filter(function(d){
        return lettersMap[filterKey].indexOf(d.letter) >= 0;
    });
*/
    var filteredLetters = letters;
    
    var zoom = 1;
    
    if (range == 'all') {
    	filteredLetters = letters;
    	zoom = 1;
    } else if(range == 'top20') {
    	filteredLetters = filteredLetters.slice(0, 20);
    	zoom = 110 / 20; // 114
    } else if(range == 'top50') {
    	filteredLetters = filteredLetters.slice(0, 50);
    	zoom = 110 / 50; // 114
    }
    
    if (filterKey == 'default') {
    	filteredLetters.sort( function(a, b) {
			return a.hero_id - b.hero_id;
		});
	} else if(filterKey == 'numwin') {
    	filteredLetters.sort( function(a, b) {
			return b.num_win - a.num_win;
		});
    } else if(filterKey == 'winrate') {
    	filteredLetters.sort( function(a, b) {
			return b.winrate - a.winrate;
		});
	}
    
    
    // brute force
    chartG.selectAll('.barWin')
		.remove();
	chartG.selectAll('.barLose')
		.remove();
	chartG.selectAll('.barRate')
		.remove();
    
    
    var nameHeroes = filteredLetters.map(function(d) {
		return d.hero_name;
    });
	var tickNameHeroes = filteredLetters.map(function(d, i) {
		return (i + 1) * barBand * zoom;
	});

	var xScaleHero = d3.scaleOrdinal()
		.domain(nameHeroes)
		.range(tickNameHeroes);

    svg.select('#axisHero')
    	.transition()
		.call(d3.axisBottom(xScaleHero))
		.selectAll('text')
				.style('text-anchor', 'end')
				.attr('transform', 'rotate(-65)')
				.attr('dx', '-1em')
				.attr('dy', '.15em');


    // Create a d3-selection using the 'bar' classname
    // Very important to use the same classname that we specify below
    var barsWin = chartG.selectAll('.barWin')
        .data(filteredLetters, function(d){
            return d.hero_id; // Use a key-function to maintain object constancy
        });
    var barsLose = chartG.selectAll('.barLose')
        .data(filteredLetters, function(d){
            return d.hero_id; // Use a key-function to maintain object constancy
        });
    var barsRate = chartG.selectAll('.barRate')
        .data(filteredLetters, function(d){
            return d.hero_id; // Use a key-function to maintain object constancy
        });

    // Create the enter selection
    // Here we will append new groups
    var barsEnterWin = barsWin.enter()
        .append('g')
        .attr('class', 'barWin')
        .on('mouseover', function(d) {
            // Use this to select the hovered element
            var hovered = d3.select(this);
            // add hovered class to style the group
            hovered.classed('hovered', true);
            // add a new text value element to the group
            hovered.append('text')
                .attr('class', 'value')
				.style('text-anchor', 'start')
				.style('font-size', '10px')
				.style('fill','white')
				.attr('transform', 'rotate(-65)')
                .attr('dx', '.5em')
                .attr('dy', '.5em')
                .text(d.num_win);
        })
        .on('mouseout', function(d) {
            // Clean up the actions that happened in mouseover
            var hovered = d3.select(this);
            hovered.classed('hovered', false);
            hovered.select('text.value').remove();
        });
    var barsEnterLose = barsLose.enter()
        .append('g')
        .attr('class', 'barLose')
        .on('mouseover', function(d) {
            // Use this to select the hovered element
            var hovered = d3.select(this);
            // add hovered class to style the group
            hovered.classed('hovered', true);
            // add a new text value element to the group
            hovered.append('text')
                .attr('class', 'value')
                .style('text-anchor', 'end')
				.style('font-size', '15px')
				.style('fill','white')
				.attr('transform', function(d) {
            		return 'translate('+[0, yScaleLose(d.num_lose) + 8]+')rotate(-65)';
            	})
                .attr('dx', '.5em')
                .attr('dy', '.5em')
                .text(d.num_lose);
        })
        .on('mouseout', function(d) {
            // Clean up the actions that happened in mouseover
            var hovered = d3.select(this);
            hovered.classed('hovered', false);
            hovered.select('text.value').remove();
        });
    var barsEnterRate = barsRate.enter()
        .append('g')
        .attr('class', 'barRate')
        .on('mouseover', function(d) {
            // Use this to select the hovered element
            var hovered = d3.select(this);
            // add hovered class to style the group
            hovered.classed('hovered', true);
            // add a new text value element to the group
            hovered.append('text')
                .attr('class', 'value')
                .style('text-anchor', function(d) {
                	if(d.winrate < 50) { return 'end'; }
        			else { return 'start'; }
                })
				.style('font-size', '15px')
				.style('fill', 'white')
				.attr('transform', function(d) {
					if(d.winrate < 50) { return 'translate('+[0, yScaleRate(d.winrate) + 8]+')rotate(-65)'; }
        			else { return 'translate('+[-1, 0]+')rotate(-65)'; }
            	})
                .attr('dx', '.5em')
                .attr('dy', '.5em')
                .text(d.winrate);
        })
        .on('mouseout', function(d) {
            // Clean up the actions that happened in mouseover
            var hovered = d3.select(this);
            hovered.classed('hovered', false);
            hovered.select('text.value').remove();
        });

    // Create an UPDATE + ENTER selection
    // Selects all data-bound elements that are in SVG or just added to SVG
    barsWin.merge(barsEnterWin)
        .transition()
        .attr('transform', function(d,i){
            return 'translate('+[(i * barBand + 10) * zoom, chartHeight - yScaleWin(maxNum - d.num_win)]+')'; // Update position based on index
        });
    barsLose.merge(barsEnterLose)
        .transition()
        .attr('transform', function(d,i){
            return 'translate('+[(i * barBand + 10) * zoom, chartHeight]+')'; // Update position based on index
        });
    barsRate.merge(barsEnterRate)
        .transition()
        .attr('transform', function(d,i){
            return 'translate('+[(i * barBand + 10 + barHeight * 0.4) * zoom, chartHeight - (Math.abs(yScaleRate(d.winrate)) - yScaleRate(d.winrate)) / 2]+')'; // Update position based on index
        });


    // Add rectangles to the ENTER selection
    // This will add a rectangle to each new group element
    barsEnterWin.append('rect')
        .attr('width', barHeight * zoom)
        .attr('height', function(d){
            return yScaleWin(maxNum - d.num_win);
        })
        .attr('fill', function(d){
            return colorScaleWin(maxNum - d.num_win);
        });
    barsEnterLose.append('rect')
        .attr('width', barHeight * zoom)
        .attr('height', function(d){
            return yScaleLose(d.num_lose);
        })
        .attr('fill', function(d){
            return colorScaleLose(d.num_lose);
        });
    barsEnterRate.append('rect')
        .attr('width', barHeight / 5 * zoom)
        .attr('height', function(d){
            return Math.abs(yScaleRate(d.winrate));
        })
        .attr('fill', function(d){
        	if(d.winrate < 50) { return 'yellow'; }
        	else { return 'green'; }
        });
        
/*      
	var dotsRate = chartG.append('g')
		.selectAll('circle')
		.data(filteredLetters)
		.enter()
		.append('circle')
		.attr('r', 5)
		.attr('transform', function(d,i){
            return 'translate('+[i * barBand + 10, chartHeight - yScaleWin(maxNum - d.num_win)]+')'; // Update position based on index
        })
		.attr('fill', 'green');
*/


    // Use the EXIT selection to remove all bars that have been filtered out
    // Using a key-function in the data() method is crucial to a proper EXIT
    barsWin.exit().remove();
    barsLose.exit().remove();
    barsRate.exit().remove();
}
// Remember code outside of the data callback function will run before the data loads
