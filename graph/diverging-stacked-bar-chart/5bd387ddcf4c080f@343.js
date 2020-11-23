// https://observablehq.com/@d3/diverging-stacked-bar-chart@343
import define1 from "./a33468b95d0b15b0@698.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["politifact.csv",new URL("./files/00677154fd47f6e479b42c7e5e95120a918d07c06cb2eee835a24e01a52d65c03afba70fbbe4c760f1bc41efec40d793f7b374c8b9bc86df5c1da482e33f0f78",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Diverging Stacked Bar Chart

This chart stacks negative categories to the left and positive categories to the right. Inspired by Robert Mann, the truthfulness of presidential candidates is assessed here by PolitiFact. For reasons to avoid this chart form, see [Rost & Aisch](https://blog.datawrapper.de/divergingbars/).`
)});
  main.variable(observer()).define(["swatches","color"], function(swatches,color){return(
swatches({color})
)});
  main.variable(observer("chart")).define("chart", ["d3","width","height","series","color","x","y","formatValue","xAxis","yAxis"], function(d3,width,height,series,color,x,y,formatValue,xAxis,yAxis)
{
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  svg.append("g")
    .selectAll("g")
    .data(series)
    .join("g")
      .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d.map(v => Object.assign(v, {key: d.key})))
    .join("rect")
      .attr("x", d => x(d[0]))
      .attr("y", ({data: [name]}) => y(name))
      .attr("width", d => x(d[1]) - x(d[0]))
      .attr("height", y.bandwidth())
    .append("title")
      .text(({key, data: [name, value]}) => `${name}
${formatValue(value.get(key))} ${key}`);

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);

  return svg.node();
}
);
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], async function(d3,FileAttachment)
{
  const categories = {
    "pants-fire": "Pants on fire!",
    "false": "False",
    "mostly-false": "Mostly false",
    "barely-true": "Mostly false", // recategorized
    "half-true": "Half true",
    "mostly-true": "Mostly true",
    "true": "True"
  };

  const data = d3.csvParse(await FileAttachment("politifact.csv").text(), ({speaker: name, ruling: category, count: value}) => categories[category] ? {name, category: categories[category], value: +value} : null);

  // Normalize absolute values to percentage.
  d3.rollup(data, group => {
    const sum = d3.sum(group, d => d.value);
    for (const d of group) d.value /= sum;
  }, d => d.name);

  return Object.assign(data, {
    format: ".0%",
    negative: "← More falsehoods",
    positive: "More truths →",
    negatives: ["Pants on fire!", "False", "Mostly false"],
    positives: ["Half true", "Mostly true", "True"]
  });
}
);
  main.variable(observer("signs")).define("signs", ["data"], function(data){return(
new Map([].concat(
  data.negatives.map(d => [d, -1]),
  data.positives.map(d => [d, +1])
))
)});
  main.variable(observer("bias")).define("bias", ["d3","data","signs"], function(d3,data,signs){return(
d3.rollups(data, v => d3.sum(v, d => d.value * Math.min(0, signs.get(d.category))), d => d.name)
  .sort(([, a], [, b]) => d3.ascending(a, b))
)});
  main.variable(observer("series")).define("series", ["d3","data","signs"], function(d3,data,signs){return(
d3.stack()
    .keys([].concat(data.negatives.slice().reverse(), data.positives))
    .value(([, value], category) => signs.get(category) * (value.get(category) || 0))
    .offset(d3.stackOffsetDiverging)
  (d3.rollups(data, data => d3.rollup(data, ([d]) => d.value, d => d.category), d => d.name))
)});
  main.variable(observer("x")).define("x", ["d3","series","margin","width"], function(d3,series,margin,width){return(
d3.scaleLinear()
    .domain(d3.extent(series.flat(2)))
    .rangeRound([margin.left, width - margin.right])
)});
  main.variable(observer("y")).define("y", ["d3","bias","margin","height"], function(d3,bias,margin,height){return(
d3.scaleBand()
    .domain(bias.map(([name]) => name))
    .rangeRound([margin.top, height - margin.bottom])
    .padding(2 / 33)
)});
  main.variable(observer("color")).define("color", ["d3","data"], function(d3,data){return(
d3.scaleOrdinal()
    .domain([].concat(data.negatives, data.positives))
    .range(d3.schemeSpectral[data.negatives.length + data.positives.length])
)});
  main.variable(observer("xAxis")).define("xAxis", ["margin","d3","x","width","formatValue","data"], function(margin,d3,x,width,formatValue,data){return(
g => g
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x)
        .ticks(width / 80)
        .tickFormat(formatValue)
        .tickSizeOuter(0))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", x(0) + 20)
        .attr("y", -24)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(data.positive))
    .call(g => g.append("text")
        .attr("x", x(0) - 20)
        .attr("y", -24)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text(data.negative))
)});
  main.variable(observer("yAxis")).define("yAxis", ["d3","y","bias","x"], function(d3,y,bias,x){return(
g => g
    .call(d3.axisLeft(y).tickSizeOuter(0))
    .call(g => g.selectAll(".tick").data(bias).attr("transform", ([name, min]) => `translate(${x(min)},${y(name) + y.bandwidth() / 2})`))
    .call(g => g.select(".domain").attr("transform", `translate(${x(0)},0)`))
)});
  main.variable(observer("formatValue")).define("formatValue", ["d3","data"], function(d3,data)
{
  const format = d3.format(data.format || "");
  return x => format(Math.abs(x));
}
);
  main.variable(observer("height")).define("height", ["bias","margin"], function(bias,margin){return(
bias.length * 33 + margin.top + margin.bottom
)});
  main.variable(observer("margin")).define("margin", function(){return(
{top: 40, right: 30, bottom: 0, left: 80}
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  const child1 = runtime.module(define1);
  main.import("swatches", child1);
  return main;
}
