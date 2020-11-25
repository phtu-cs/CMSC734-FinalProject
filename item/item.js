var matchStatus = [];       //record matchStatus
var matchItems = [];        //record match and items (finally) bought in the match
var itemIdName = [];        //record item index and its name
var itemWinrate = [];       //id, name, total bought times, win times, win rate
var top20Winrate = [];
var top20Frequency = [];
var allItems = [];
var coreItems = [];
var supportItems = [];


//save data into arrays
d3.csv("match.csv").then(function(data) {
    data.forEach(function(d) {
        matchStatus.push([d["match_id"], d["radiant_win"]]);
    });
});

d3.csv("players.csv").then(function(data) {
    var count = 0;
    data.forEach(function(d) {
        if (count < 5) {    //True or False means if this player is playing as Radiant
            matchItems.push([d["match_id"], "True", d["item_0"], d["item_1"], d["item_2"], d["item_3"], d["item_4"], d["item_5"]]);
            count ++;
        } else {
            matchItems.push([d["match_id"], "False", d["item_0"], d["item_1"], d["item_2"], d["item_3"], d["item_4"], d["item_5"]]);
            count = (count + 1)%10;
        }
    });
});

d3.csv("item_info.csv").then(function(data) {
    data.forEach(function(d) {
        itemIdName.push([d["item_id"], d["item_name"]]);
        if (d["core_item"] == "1") {
            coreItems.push(d["item_id"]);
            allItems.push(d["item_id"]);
        } else if (d["core_item"] == "2") {
            supportItems.push(d["item_id"]);
            allItems.push(d["item_id"]);
        }
    });

});



//Counting the item winrate
function countingWinRate() {
    for (var i=0; i<itemIdName.length; i++) {
        itemWinrate.push([itemIdName[i][0], itemIdName[i][1], 0 , 0]);
    }

    for (var i=0;i<matchItems.length; i++) {
        var match_id = matchItems[i][0];
        for (var j=3;j<=7;j++) {
            var item_id = matchItems[i][j];
            var itemWin = matchStatus[parseInt(match_id)][1] == matchItems[i][1];
            for (var k=0;k<itemWinrate.length;k++) {
                if (itemWinrate[k][0] == item_id) {
                    if (itemWin) {
                        itemWinrate[k][2] += 1;
                        itemWinrate[k][3] += 1;
                    } else {
                        itemWinrate[k][2] += 1;
                    }
                }
            }
        }
    }
    for (var i=0; i<itemWinrate.length; i++) {
        if (itemWinrate[i][2] == 0) {
            itemWinrate[i].push(0);
        } else {
            itemWinrate[i].push(itemWinrate[i][3] / itemWinrate[i][2]);
        }
    }

}


//Sorting itemWinrate array by win rate
function sortItemByWinrate() {
    for (var i=0; i<itemWinrate.length; i++) {
        if (itemWinrate[i][1] == "flying_courier") {
            itemWinrate.splice(i, 1);
        }
    }

    itemWinrate.sort(function(a,b) {
        return b[4] - a[4];
    });
    for (var i=0;i<itemWinrate.length;i++) {
        top20Winrate.push([itemWinrate[i][0], itemWinrate[i][1], itemWinrate[i][4]]);
    }

    itemWinrate.sort(function(a,b) {
        return b[2] - a[2];
    });
    for (var i=0;i<itemWinrate.length;i++) {
        top20Frequency.push([itemWinrate[i][0], itemWinrate[i][1], itemWinrate[i][2]]);
    }

}


/**************************************************/
/**************************************************/
setTimeout(() => {
    countingWinRate();
    sortItemByWinrate();
    updateChart(top20Winrate, allItems);
}, 1000);
//Ploting the graph

var svg = d3.select('svg');
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b:30, l:50};

var chartWidth = svgWidth - padding.l - padding.r - 200;
var chartHeight = svgHeight - padding.t - padding.b;

var barBand = chartHeight / 20;
var barHeight = barBand * 0.7;

var chartG = svg.append('g')
                .attr('transform', 'translate('+[100, padding.t]+')');
chartG.selectAll('.bar').data();


function updateChart(dataForShow, itemCategory) {
    var removeAxis = document.getElementById("axisOfItemFigure");
    if (removeAxis != null) {
        removeAxis.remove();
    }
    var removeText = document.getElementById("labelOfItemFigure");
    if (removeText != null) {
        removeText.remove();
    }

    //Get the max width of the bars
    var maxVal = 0;
    for (var i=0; i<dataForShow.length; i++) {
        maxVal = Math.max(maxVal, dataForShow[i][2]);
    }

    if (maxVal < 1) {
        var xScale = d3.scaleLinear()
                            .domain([0, 1])
                            .range([0,chartWidth]);
        var axis = d3.axisTop(xScale)
                  .ticks(5)
                  .tickFormat(d => (100 * d | 0) + "%");
        var tempAxis = svg.append("g")
            .attr("class", "axis")
            .attr("id", "axisOfItemFigure")
            .attr("transform", "translate(170,55)")
            .call(axis);
        var text = svg.append("text")
            .attr("class", "label")
            .attr("id", "labelOfItemFigure")
            .attr("transform", "translate(410,30)")
            .text("Win Rate (%)");
    } else {    //Purchase frequency
        maxVal = 150000;
        var xScale = d3.scaleLinear()
                            .domain([0, maxVal])
                            .range([0,chartWidth]);
        var axis = d3.axisTop(xScale)
                  .ticks(5)
                  .tickFormat(d => d);
        var tempAxis = svg.append("g")
            .attr("class", "axis")
            .attr("id", "axisOfItemFigure")
            .attr("transform", "translate(170,55)")
            .call(axis);
        var text = svg.append("text")
            .attr("class", "label")
            .attr("id", "labelOfItemFigure")
            .attr("transform", "translate(300,30)")
            .text("Pruchase Frequency (Every 50,000 Games)");
    }


    var g = svg.append('g');

    var tempData = [];
    var counter = 0;
    for (var i=0; i<dataForShow.length; i++) {
        for (var j=0; j<itemCategory.length; j++) {
            if (dataForShow[i][0] == itemCategory[j] && counter < 20) {
                tempData.push(dataForShow[i]);
                counter ++;
            } else if (counter == 20) {
                break;
            }
        }
    }

    var bars = chartG.selectAll('.bar')
       .data(tempData, function(d){
           return d[1] + d[2].toString();   //I have to give the name of this element an uniqe name
       });

    var barsEnter = bars.enter()
        .append('g')
        .attr('class', 'bar');

    bars.merge(barsEnter)
        .attr('transform', function(d,i){
           return 'translate('+[10, i * barBand + 4]+')';
       });

    var rect = barsEnter.append('rect')
                        .attr('transform', 'translate(60,0)')
                        .attr('height', barHeight)
                        .attr('width', function(d){
                            return xScale(d[2]);
                        });

    barsEnter.append('text')
        .attr('x', -90)
        .attr('dy', '0.9em')
        .text(function(d){
            return d[1];
       });

    bars.exit().remove();
}


//Change by selection
function onCategoryChanged() {
    var select = d3.select('#statSelect').node();
    var stat = select.options[select.selectedIndex].value;

    var select2 = d3.select('#categorySelect').node();
    var category = select2.options[select2.selectedIndex].value;

    if (stat == "top20Winrate") {
        if (category == "allItems") {
            updateChart(top20Winrate, allItems);
        } else if (category == "coreItems") {
            updateChart(top20Winrate, coreItems);
        } else {
            updateChart(top20Winrate, supportItems);
        }
    } else if (stat == "top20Frequency"){
        if (category == "allItems") {
            updateChart(top20Frequency, allItems);
        } else if (category == "coreItems") {
            updateChart(top20Frequency, coreItems);
        } else {
            updateChart(top20Frequency, supportItems);
        }
    }

}
