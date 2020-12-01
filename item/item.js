var item_matchStatus = [];       //record matchStatus
var matchItems = [];        //record match and items (finally) bought in the match
var itemIdName = [];        //record item index and its name
var itemWinrate = [];       //id, name, total bought times, win times, win rate
var top20Winrate = [];
var top20Frequency = [];
var allItems = [];
var coreItems = [];
var supportItems = [];
var item_heroNames = [];


//save data into arrays
d3.csv("/item/item-match.csv").then(function(data) {
    data.forEach(function(d) {
        item_matchStatus.push([d["match_id"], d["radiant_win"]]);
    });
});

d3.csv("/item/item-players.csv").then(function(data) {
    var count = 0;
    data.forEach(function(d) {
        if (count < 5) {    //True or False means if this player is playing as Radiant
            matchItems.push([d["match_id"], "True", d["item_0"], d["item_1"], d["item_2"], d["item_3"], d["item_4"], d["item_5"], d["hero_id"]]);
            count ++;
        } else {
            matchItems.push([d["match_id"], "False", d["item_0"], d["item_1"], d["item_2"], d["item_3"], d["item_4"], d["item_5"], d["hero_id"]]);
            count = (count + 1)%10;
        }
    });
});

d3.csv("/item/item-item_info.csv").then(function(data) {
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

d3.csv("/item/item-hero_names.csv").then(function(data) {
    data.forEach(function(d) {
        item_heroNames.push([d["hero_id"], d["name"]]);
    })
})




//Counting the item winrate
function countingWinRate() {
    for (var i=0; i<itemIdName.length; i++) {
        itemWinrate.push([itemIdName[i][0], itemIdName[i][1], 0 , 0]);
    }

    for (var i=0;i<matchItems.length; i++) {
        var match_id = matchItems[i][0];
        for (var j=3;j<=7;j++) {
            var item_id = matchItems[i][j];
            var itemWin = item_matchStatus[parseInt(match_id)][1] == matchItems[i][1];
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
    updateOptions();
    updateChart(top20Winrate, allItems);
    updateItemHeroChart(null);

}, 2000);
//Ploting the graph

var item_svg = d3.select("#items");

var item_svgWidth = +item_svg.attr('width');
var item_svgHeight = +item_svg.attr('height');

var item_padding = {t: 60, r: 40, b:30, l:50};

var item_chartWidth = item_svgWidth - item_padding.l - item_padding.r - 200;
var item_chartHeight = item_svgHeight - item_padding.t - item_padding.b;

var item_barBand = item_chartHeight / 20;
var item_barHeight = item_barBand * 0.7;

var item_chartG = item_svg.append('g')
                .attr('transform', 'translate('+[100, item_padding.t]+')');
item_chartG.selectAll('.bar').data();

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
                            .range([0,item_chartWidth]);
        var axis = d3.axisTop(xScale)
                  .ticks(5)
                  .tickFormat(d => (100 * d | 0) + "%");
        var tempAxis = item_svg.append("g")
            .attr("class", "axis")
            .attr("id", "axisOfItemFigure")
            .attr("transform", "translate(170,55)")
            .call(axis);
        var text = item_svg.append("text")
            .attr("class", "label")
            .attr("id", "labelOfItemFigure")
            .attr("transform", "translate(410,30)")
            .attr("color", "white")
            .text("Win Rate (%)");
    } else {    //Purchase frequency
        maxVal = 150000;
        var xScale = d3.scaleLinear()
                            .domain([0, maxVal])
                            .range([0,item_chartWidth]);
        var axis = d3.axisTop(xScale)
                  .ticks(5)
                  .tickFormat(d => d);
        var tempAxis = item_svg.append("g")
            .attr("class", "axis")
            .attr("id", "axisOfItemFigure")
            .attr("transform", "translate(170,55)")
            .call(axis);
        var text = item_svg.append("text")
            .attr("class", "label")
            .attr("id", "labelOfItemFigure")
            .attr("transform", "translate(300,30)")
            .attr("color", "white")
            .text("Pruchase Frequency (Every 50,000 Games)");
    }


    var g = item_svg.append('g');

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

    var bars = item_chartG.selectAll('.bar')
       .data(tempData, function(d){
           return d[1] + d[2].toString();   //I have to give the name of this element an uniqe name
       });

    var barsEnter = bars.enter()
        .append('g')
        .attr('class', 'bar');

    bars.merge(barsEnter)
        .attr('transform', function(d,i){
           return 'translate('+[10, i * item_barBand + 4]+')';
       });

    var rect = barsEnter.append('rect')
                        .attr('class', 'rect')
                        .attr('transform', 'translate(60,0)')
                        .attr('height', item_barHeight)
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


/**************************************************/
/**************************************************/
/* Second Graph*/
var itemsOptions = [];          //item_id, item_name
var itemWithHeros = [];        //item_id, hero_id, hero_id ...


function updateOptions() {

    for (var i=0;i<itemIdName.length;i++) {
        for (var j=0;j<coreItems.length;j++) {
            if (itemIdName[i][0] == coreItems[j]) {
                itemsOptions.push(itemIdName[i]);
            }
        }
        for (var j=0;j<supportItems.length;j++) {
            if (itemIdName[i][0] == supportItems[j]) {
                itemsOptions.push(itemIdName[i]);
            }
        }
    }

    var itemHeroSelection = d3.select("#itemHeroSelect");
    for (var i=0;i<itemsOptions.length;i++) {
        itemHeroSelection.append("option")
                                .attr("value", itemsOptions[i][1])
                                .text(itemsOptions[i][1]);
    }


    //Update item - hero relation
    for (var i=0;i<matchItems.length;i++) {
        var flag = false;
        for (var j=0;j<itemWithHeros.length;j++) {
            if (itemWithHeros[j][0] == matchItems[i][2]) {
                flag = true;
                var addHero = true;
                for (var k=1; k<itemWithHeros[j].length; k++) {
                    if(itemWithHeros[j][k] == matchItems[i][8]) {
                        addHero = false;
                    }
                }
                if (addHero && itemWithHeros[j].length < 6) {
                    itemWithHeros[j].push(matchItems[i][8]);
                }
            }
        }
        if (!flag) {
            itemWithHeros.push([matchItems[i][2], matchItems[i][8]]);
        }
    }

}

function updateItemHeroChart(itemSelection) {
    //remove previous graphs first
    var removeItem = document.getElementById("itemText");
    if (removeItem != null) {
        removeItem.remove();
    }
    var removeHero0 = document.getElementById("heroText0");
    if (removeHero0 != null) {
        removeHero0.remove();
    }
    var removeHero1 = document.getElementById("heroText1");
    if (removeHero1 != null) {
        removeHero1.remove();
    }
    var removeHero2 = document.getElementById("heroText2");
    if (removeHero2 != null) {
        removeHero2.remove();
    }
    var removeHero3 = document.getElementById("heroText3");
    if (removeHero3 != null) {
        removeHero3.remove();
    }
    var removeHero4 = document.getElementById("heroText4");
    if (removeHero4 != null) {
        removeHero4.remove();
    }

    var itemCircle = d3.select("#itemHero")
                    .append("circle")
                    .attr("class", "itemCircle")
                    .attr("cx", 200)
                    .attr("cy", 300)
                    .attr("r", 20);
    var itemName;
    var item_heroNamesForText;
    if (itemSelection == null) {
        itemName = "No selection";
        item_heroNamesForText = ["No selection", "No selection", "No selection", "No selection", "No selection"];
    } else {
        itemName = itemSelection;
        var itemId;
        item_heroNamesForText = [];
        for (var i=0;i<itemIdName.length;i++) {
            if (itemIdName[i][1] == itemSelection) {
                itemId = itemIdName[i][0];
                for (var j=0;j<itemWithHeros.length;j++) {
                    if (itemWithHeros[j][0] == itemId) {
                        item_heroNamesForText.push(itemWithHeros[i][1]);
                        item_heroNamesForText.push(itemWithHeros[i][2]);
                        item_heroNamesForText.push(itemWithHeros[i][3]);
                        item_heroNamesForText.push(itemWithHeros[i][4]);
                        item_heroNamesForText.push(itemWithHeros[i][5]);
                    }
                }

            }
        }

        for (var i=0;i<item_heroNamesForText.length;i++) {
            for (var j=0; j<item_heroNames.length;j++) {
                if (item_heroNames[j][0] == item_heroNamesForText[i]) {
                    item_heroNamesForText[i] = item_heroNames[j][1];
                }
            }
        }
    }

    var itemText = d3.select("#itemHero")
                        .append("text")
                        .text(itemName)
                        .attr("id", "itemText")
                        .attr("x", 200)
                        .attr("y", 280)
                        .attr("text-anchor", "middle");

    var heroCircle1 = d3.select("#itemHero")
                    .append("circle")
                    .attr("class", "heroCircle")
                    .attr("cx", 600)
                    .attr("cy", 100)
                    .attr("r", 20);
    var heroCircle2 = d3.select("#itemHero")
                    .append("circle")
                    .attr("class", "heroCircle")
                    .attr("cx", 600)
                    .attr("cy", 200)
                    .attr("r", 20);
    var heroCircle3 = d3.select("#itemHero")
                    .append("circle")
                    .attr("class", "heroCircle")
                    .attr("cx", 600)
                    .attr("cy", 300)
                    .attr("r", 20);
    var heroCircle4 = d3.select("#itemHero")
                    .append("circle")
                    .attr("class", "heroCircle")
                    .attr("cx", 600)
                    .attr("cy", 400)
                    .attr("r", 20);
    var heroCircle5 = d3.select("#itemHero")
                    .append("circle")
                    .attr("class", "heroCircle")
                    .attr("cx", 600)
                    .attr("cy", 500)
                    .attr("r", 20);

    var heroText1 = d3.select("#itemHero")
                        .append("text")
                        .text(item_heroNamesForText[0])
                        .attr("id", "heroText0")
                        .attr("x", 600)
                        .attr("y", 80)
                        .attr("text-anchor", "middle");
    var heroText2 = d3.select("#itemHero")
                        .append("text")
                        .text(item_heroNamesForText[1])
                        .attr("id", "heroText1")
                        .attr("x", 600)
                        .attr("y", 180)
                        .attr("text-anchor", "middle");
    var heroText3 = d3.select("#itemHero")
                        .append("text")
                        .text(item_heroNamesForText[2])
                        .attr("id", "heroText2")
                        .attr("x", 600)
                        .attr("y", 280)
                        .attr("text-anchor", "middle");
    var heroText4 = d3.select("#itemHero")
                        .append("text")
                        .text(item_heroNamesForText[3])
                        .attr("id", "heroText3")
                        .attr("x", 600)
                        .attr("y", 380)
                        .attr("text-anchor", "middle");
    var heroText5 = d3.select("#itemHero")
                        .append("text")
                        .text(item_heroNamesForText[4])
                        .attr("id", "heroText4")
                        .attr("x", 600)
                        .attr("y", 480)
                        .attr("text-anchor", "middle");

    const markerBoxWidth = 20;
    const markerBoxHeight = 20;
    const refX = markerBoxWidth / 2;
    const refY = markerBoxHeight / 2;
    const markerWidth = markerBoxWidth / 2;
    const markerHeight = markerBoxHeight / 2;
    const arrowPoints = [[0, 0], [0, 20], [20, 10]];

    d3.select("#itemHero")
        .append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
        .attr('refX', refX)
        .attr('refY', refY)
        .attr('markerWidth', markerBoxWidth)
        .attr('markerHeight', markerBoxHeight)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d3.line()(arrowPoints))
        .attr('stroke', 'black');

    d3.select("#itemHero").append('path')
                          .attr('d', d3.line()([[200, 300], [570, 100]]))
                          .attr('stroke', 'black')
                          .attr('marker-end', 'url(#arrow)')
                          .attr('fill', 'none');
    d3.select("#itemHero").append('path')
                        .attr('d', d3.line()([[200, 300], [570, 200]]))
                        .attr('stroke', 'black')
                        .attr('marker-end', 'url(#arrow)')
                        .attr('fill', 'none');
    d3.select("#itemHero").append('path')
                        .attr('d', d3.line()([[200, 300], [570, 300]]))
                        .attr('stroke', 'black')
                        .attr('marker-end', 'url(#arrow)')
                        .attr('fill', 'none');
    d3.select("#itemHero").append('path')
                        .attr('d', d3.line()([[200, 300], [570, 400]]))
                        .attr('stroke', 'black')
                        .attr('marker-end', 'url(#arrow)')
                        .attr('fill', 'none');
    d3.select("#itemHero").append('path')
                        .attr('d', d3.line()([[200, 300], [570, 500]]))
                        .attr('stroke', 'black')
                        .attr('marker-end', 'url(#arrow)')
                        .attr('fill', 'none');

}

function onItemHeroChanged() {
    var selectItem = d3.select('#itemHeroSelect').node();
    var tempVal = selectItem.options[selectItem.selectedIndex].value;
    //console.log(tempVal);
    updateItemHeroChart(tempVal);
}
