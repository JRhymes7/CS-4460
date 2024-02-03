// Global function called when select element is changed
var category = "all-letters";
var cutoffValue = 0;
var letters;
function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    // Get current value of select element
    category = select.options[select.selectedIndex].value;
    // Update chart with the selected category of letters
    console.log(category);
    updateChart(category,cutoffValue);
}

// Recall that when data is loaded into memory, numbers are loaded as Strings
// This function converts numbers into Strings during data preprocessing
function dataPreprocessor(row) {
    return {
        letter: row.letter,
        frequency: +row.frequency
    };
}

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 30, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

// Compute the spacing for bar bands based on all 26 letters
var barBand = chartHeight / 26;
var barHeight = barBand * 0.7;

// A map with arrays for each category of letter sets
var lettersMap = {
    'only-consonants': 'BCDFGHJKLMNPQRSTVWXZ'.split(''),
    'only-vowels': 'AEIOUY'.split(''),
    'all-letters': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
};

d3.csv('letter_freq.csv', dataPreprocessor).then(function(dataset) {
    // Create global variables here and intialize the chart
    letters = dataset;

    var letter_freq = d3.max(dataset, function(d){
        return d.frequency;
    });

    // **** Your JavaScript code goes here ****
    xScale = d3.scaleLinear()
        .domain([0, letter_freq])
        .range([0, chartWidth]);

    var percentage = function(d) {
        return d * 100 + '%';
    }

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate('+[padding.l, padding.t]+')')
        .call(d3.axisTop(xScale).ticks(6).tickFormat(percentage));

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate('+[padding.l, svgHeight - padding.b]+')')
        .call(d3.axisBottom(xScale).ticks(6).tickFormat(percentage));

    // Update the chart for all letters to initialize
    updateChart('all-letters',cutoffValue);
});

var main = document.getElementById('main');
d3.select(main)
        .append('p')
        .append('button')
        .style("border", "1px solid black")
        .text('Filter Data')
        .on('click', function() {
            cutoffValue = document.getElementById('cutoff').value;
            updateChart(category,cutoffValue)
        });

function updateChart(filterKey,cutoffValue) {
    // Create a filtered array of letters based on the filterKey
    var filteredLetters = letters.filter(function(d){
        return lettersMap[filterKey].indexOf(d.letter) >= 0;
    });

    var filteredValues = filteredLetters.filter(function(d){
        return d.frequency * 100 >= cutoffValue;

    });


    // **** Draw and Update your chart here ****
    var bar = chartG.selectAll('.bar')
        .data(filteredValues, function(d){
            return d.letter;
        });

    var bar_Enter = bar.enter()
        .append('g')
        .attr('class', 'bar');

    bar.merge(bar_Enter)
        .attr('transform', function(d,i){
            return 'translate('+[0, i * barBand + 4]+')';
        });

    bar_Enter.append('rect')
        .attr('height', barHeight)
        .attr('width', function(d){
            return xScale(d.frequency);
        });

    bar_Enter.append('text')
        .attr('x', -20)
        .attr('dy', '0.9em')
        .text(function(d){
            return d.letter;
        });

    bar.exit().remove();

}

// Remember code outside of the data callback function will run before the data loads