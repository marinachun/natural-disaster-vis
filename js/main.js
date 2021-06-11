// Initialize helper function to convert date strings to date objects
const parseTime = d3.timeParse("%Y-%m-%d");

let data, timeline;
d3.csv('data/disaster_costs.csv')
    .then(_data => {
        data = _data;
        data.forEach(d => {
            d.cost = +d.cost;
            d.year = +d.year;
            d.date = parseTime(d.mid);
        });

        timeline = new Timeline({ parentElement: '#vis'}, data);
        timeline.updateVis();
    })
    .catch(error => console.error(error));

d3.selectAll('.legend-btn').on('click', function() {
    // Toggle 'inactive' class
    d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));

    // Check which categories are active
    let selectedCategory = [];
    d3.selectAll('.legend-btn:not(.inactive)').each(function() {
        selectedCategory.push(d3.select(this).attr('data-category'));
    });

    // Filter data accordingly and update vis
    timeline.data = data.filter(d => selectedCategory.includes(d.category));
    timeline.updateVis();
});
