class Timeline {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      disasterCategories: _config.disasterCategories,
      containerWidth: 800,
      containerHeight: 900,
      tooltipPadding: 15,
      margin: {top: 200, right: 20, bottom: 20, left: 45},
      legendWidth: 170,
      legendHeight: 8,
      legendRadius: 5
    }
    this.data = _data;
    this.initVis();
  }
  
  /**
   * We initialize the arc generator, scales, axes, and append static elements
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.colorScale = d3.scaleOrdinal()
        .domain(['winter-storm-freeze', 'drought-wildfire', 'flooding', 'tropical-cyclone', 'severe-storm'])
        .range(['#ccc', '#ffffd9', '#41b6c4', '#081d58', '#c7e9b4']);

    // just to include the ticks at the top
    vis.xScaleMonth = d3.scaleTime()
        .domain([new Date (2016, 0, 1), new Date(2016, 11, 31)])
        .range([0, vis.width]);

    // actual scale of where to place the semicircle
    vis.xScale = d3.scaleLinear()
        .domain([1, 366])
        .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);

    // scale for the circle
    vis.radiusScale = d3.scaleSqrt()
        .domain([d3.min(vis.data, d=> d.cost), d3.max(vis.data, d=> d.cost)])
        .range([4, 140]);

    // for the months
    vis.xAxis = d3.axisTop(vis.xScaleMonth)
        .tickPadding(20)
        .tickSizeOuter(0)
        .tickFormat(d3.timeFormat("%b"));

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(d3.max(vis.data, d => d.year) - d3.min(vis.data, d => d.year))
        .tickSize(-vis.width)
        .tickPadding(10)
        .tickFormat(d3.format("d"));

    // Initialize arc generator that we use to create the SVG path for the half circles.
    vis.arcGenerator = d3.arc()
        .outerRadius(d => vis.radiusScale(d))
        .innerRadius(0)
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chartArea = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // shifting the ticks up
    vis.xAxisG = vis.chartArea.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,-20)`);

    vis.yAxisG = vis.chartArea.append('g')
        .attr('class', 'axis y-axis');

    // Initialize clipping mask that covers the whole chart
    vis.chartArea.append('defs')
      .append('clipPath')
        .attr('id', 'chart-mask')
      .append('rect')
        .attr('width', vis.width)
        .attr('y', -vis.config.margin.top)
        .attr('height', vis.config.containerHeight);

    // Apply clipping mask to 'vis.chart' to clip semicircles at the very beginning and end of a year
    vis.chart = vis.chartArea.append('g')
        .attr('clip-path', 'url(#chart-mask)');
    
    vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;

    vis.colorValue = d=> d.category;
    vis.xValue = d => d.date;
    vis.yValue = d => d[0];

    // grouping the data by year
    vis.grouping = d3.groups(vis.data, d => d.year);

    // adding the value of the maximum cost for each year
    vis.grouping.forEach(d=> {
      d[1].maxC = d3.max(d[1], k=> k.cost);
    });

    // indicating whether or not the disaster has the highest cost for that year
    for(let i = 0; i < vis.grouping.length; i++) {
      for (let j = 0; j < vis.grouping[i][1].length; j++){
        if ( vis.grouping[i][1][j].cost === vis.grouping[i][1].maxC) {
          vis.grouping[i][1][j].maxCost = 'yes';
        } else {
          vis.grouping[i][1][j].maxCost = 'no';
        }
      }
    }

    // yscale will change if the number of years change
    vis.yScale.domain(d3.extent(vis.grouping.map(vis.yValue)));
    vis.renderVis();
  }

  /**
   * Bind data to visual elements (enter-update-exit) and update axes
   */
  renderVis() {
    let vis = this;

    // row so the year in this case
    const row = vis.chart.selectAll('.year')
        .data(vis.grouping, d=> [0]);

    const rowEnter = row.enter().append('g')
        .attr('class', 'year');

    rowEnter.merge(row)
        .attr('transform', d => `translate(0,${vis.yScale(vis.yValue(d))})`);

    row.exit().remove();

    // separated by category
    const column = row.merge(rowEnter).selectAll('.category')
     .data(d=> d[1], k=> (d3.timeFormat('%j')(k.date)));

    const columnEnter = column.enter().append('g')
        .attr('class', 'category');

    // setting the position along x axis
    columnEnter.merge(column)
        .attr('transform', d => `translate(${vis.xScale(d3.timeFormat('%j')(vis.xValue(d)))},0)`);

    column.exit().remove();

    // trying to add semicircle and tooltip
    columnEnter.append('path')
        .attr('class', 'semicircle')
        .attr('d', d => vis.arcGenerator(d.cost))
        .attr('fill', d => vis.colorScale(vis.colorValue(d)))
        .attr('stroke', '#333')
        .attr('stroke-width', 0.3)
        .attr('fill-opacity', 0.6)
        .on('mouseover', (event,d) => {
          d3.select('#tooltip')
              .style('display', 'block')
              .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
              .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
              .html(`
              <div>${d.display_name}</div>
              <div>$${d.cost} billion</div>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });

    // text
    columnEnter.append('text')
        .attr('class', 'label')
        .attr('text-anchor', 'middle')
        .attr('transform', d=> `translate(0, 11)`)
        .text(d=> {
          if (d.maxCost === 'yes') {
            return d.display_name;
          } else {
            return '';
          }
        });

    vis.xAxisG.call(vis.xAxis).call((g)=> g.select(".domain").remove());
    vis.yAxisG.call(vis.yAxis).call((g)=> g.select(".domain").remove());

  }
}