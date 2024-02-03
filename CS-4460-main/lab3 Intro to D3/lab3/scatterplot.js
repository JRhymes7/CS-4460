// **** Functions to call for scaled values ****

function scaleYear(year) {
    return yearScale(year);
}

function scaleHomeruns(homeruns) {
    return hrScale(homeruns);
}

// **** Code for creating scales, axes and labels ****

var yearScale = d3.scaleLinear()
    .domain([1870,2017]).range([60,700]);

var hrScale = d3.scaleLinear()
    .domain([0,75]).range([340,20]);

var svg = d3.select('svg');

svg.append('g').attr('class', 'x axis')
    .attr('transform', 'translate(0,345)')
    .call(d3.axisBottom(yearScale).tickFormat(function(d){return d;}));
//label x-axis
svg.append('text')
    .attr('class', 'label')
    .attr('transform', 'translate(360,390)')
    .text('MLB Season');

svg.append('g').attr('class', 'y axis')
    .attr('transform','translate(55,0)')
    .call(d3.axisLeft(hrScale));
//label y-axis
svg.append('text')
    .attr('class', 'label')
    .attr('transform','translate(20,175) rotate(-90)')
    .text('Home Runs (HR)');
//add title  
svg.append('text')
    .attr('class', 'title')
    .attr('transform', 'translate(325,35)')             
    .text('Top 10 HR Leaders per MLB Season');


    
// **** Your JavaScript code goes here ****
d3.csv("baseball_hr_leaders.csv").then(function(datum) {
    var players = svg.selectAll('.player')
        .data(datum)
        .enter()
        .append('g')
        .attr('class', function(r){
            if (r.rank <= 3) {
                return 'player top3';
            } if (r.rank >= 9){
                return 'player bottom';
            } else {
                return 'player middle';
            }
        })
        .attr('transform',function(player) {
            return 'translate('+scaleYear(player['year']) + ',' + scaleHomeruns(player['homeruns']) + ')';
        });
    players.append('circle')
        .attr('r',2)
        .style('opacity', function(d){
            if (d.rank <= 3) {
                return '.6';
            } if (d.rank >= 9) {
                return '.6';
            } else {
                return '.2';
            }
        })
        .style('fill', function(d){
            if (d.rank <= 3) {
                return '#FFA500';
            } if (d.rank >= 9) {
                return '#C0C0C0';
            } else {
                return '#00FFFF';
            }
        });

    players.append('text')
        .text(function(player){
            return player['name'];
        });
});