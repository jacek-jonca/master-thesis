// Binders
$("#xaxis").change(function() {
  change_x_axis($("#xaxis option:selected").attr("value"));
});

$("#yaxis").change(function() {
  change_y_axis($("#yaxis option:selected").attr("value"));
});

$("#select-cluster").change(function() {
  $("svg circle").attr("stroke", "none");
  if ($("#select-cluster option:selected").attr("value") == "none") { return; }
  highlight_cluster($("#select-cluster option:selected").attr("value"));
  load_cluster_info($("#select-cluster option:selected").attr("value"))
});

// d3js
var colors = d3.scale.category20().range();
var palette = {};
var cluster_ids = Array();
var vis = d3.select("#clusters-vis"),
  width = 500,
  height = 500,
  margins = {top: 20, right: 20, bottom: 20, left: 40},
  xMin = 0,
  xMax = 4000,
  yMin = 0,
  yMax = 500,
  xRange = d3.scale.linear()
             .range([margins.left, width - margins.right]).domain([xMin, xMax]),
  yRange = d3.scale.linear()
             .range([height - margins.top, margins.bottom]).domain([yMin, yMax]),
  xAxis = d3.svg.axis()
            .scale(xRange)
            .tickSize(5),
  yAxis = d3.svg.axis()
            .scale(yRange)
            .tickSize(5)
            .orient("left"),
  circles;
var drawingData;

function init() {
  // d3.json("/static/data/clusters.json", function(error, json) {
  d3.json("/static/data/edo_1379164428.json", function(error, json) {
    vis.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height - margins.bottom) + ")")
      .call(xAxis);

    vis.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + (margins.left) + ",0)")
      .call(yAxis)

    $.each(json.domains, function(index, domain) {
      if (cluster_ids.indexOf(domain.cluster) == -1) {
        cluster_ids.push(domain.cluster);
      }
    });

    $.each(cluster_ids, function(index, element) {
      palette[element] = colors[index];
    });
    drawingData = json.domains;
    update(json.domains);

    $.each(cluster_ids, function(index, id) {
      $('#select-cluster')
         .append($("<option></option>")
         .attr("value", id)
         .text(id)); 
    });
  });
}

function update(data) {
  circles = vis.selectAll("circle")
                 .data(data, function(d) { return d.url; });
  circles.enter()
    .insert("circle")
      .attr("cx", function(d) { return xRange(+d.one_gram); })
      .attr("cy", function(d) { return yRange(+d.two_gram); })
      .attr("class", function(d) { return d.cluster; })
      .attr("id", function(d) { return d.url })
      .attr("r", 2)
      .style("fill", function(d) { return palette[d.cluster]; });

  $("circle").hover(
    function() { $(this).attr("stroke", "red");  },
    function() { $(this).attr("stroke", "none"); }
  );

  $("circle").click(
  function() {
    domain = $(this).attr("id");
    load_domain_info(domain);
  }
);
}

function change_x_axis(domain) {
  transition = vis.transition().duration(1000).ease("exp-in-out"); 
  xRange.domain([
    d3.min (drawingData, function(d) { return +d[domain]; }),
    d3.max (drawingData, function(d) { return +d[domain]; })
  ]);
  transition.select(".x.axis").call(xAxis);
  circles.transition().duration(1000).ease("exp-in-out")
    .attr("cx", function(d) { return xRange(+d[domain])});
}

function change_y_axis(domain) {
  transition = vis.transition().duration(1000).ease("exp-in-out");
  yRange.domain([
    d3.min (drawingData, function(d) { return +d[domain]; }),
    d3.max (drawingData, function(d) { return +d[domain]; })
  ]);
  
  transition.select(".y.axis").call(yAxis);
  circles.transition().duration(1000).ease("exp-in-out")
    .attr("cy", function(d) { return yRange(+d[domain])});
}

function highlight_cluster(cluster) {
  $("." + cluster).attr("stroke", "red");
}

function load_domain_info(domain) {
  console.log(drawingData);

}

function format_min_max(values) {
  return "Min: " + values[0] + " Max: " + values[1];
}

init();

// Radar Chart
d = [
     [
       {axis: "meaningful word ratio", value: 0}, 
       {axis: "one gram", value: 3674.5454545454545}, 
       {axis: "two gram", value: 6.888888888888889},  
       {axis: "three gram", value: 207.2}
     ]
];

RadarChart.draw("#radar-chart", d);