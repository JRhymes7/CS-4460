//define global variables outside of file load
var containerID = "#graph";
var detailCard = "#details";
var width = $(containerID).parent().width();
var height = window.innerHeight - 200;
var options = "#options";
var searchBox = "#searchbox";
var cast = [];
var tvShows = [];

d3.json("netflix.json").then(function (data) {
//create array of all names of tv shows and actors to be searched
    let allSearch = [];
    data.nodes.forEach((d) => {
        if (d["type"] == "TV Show") {
            d.radius = 7;
        } else if (d["type"] == "Actor") {
            d.radius = 4;
        }
        allSearch.push(d['name']);
        if(d['type'] == 'TV Show'){
            tvShows.push(d['name']);
        }else{
            cast.push(d['name']);
        }
    });
//apply search options to the html setup
    allSearch.forEach(function(option){
        $(options).append(`<option value="${option}"></option>`);
    });
//sort all search options alphabetically
    $(searchBox).on('change', function() {
        let searchString = this.value;
        if (tvShows.indexOf(searchString) !== -1 || cast.indexOf(searchString) !== -1){
            for (let i = 0; i < data.nodes.length; i++) {
                if (data.nodes[i].name == searchString) {
                    focus(data.nodes[i], i, "search");
                }
            }
        } else{
            normal();
        }
    });
//normal() will set the nodes back to original setup after clicking 
    function normal() {
        $(details).empty();
        $("#searchbox").val('');

        nodeEnter.select("circle").style("stroke-width", 0);
        nodeEnter.select("text").style("visibility","hidden");
        nodeEnter.style("opacity", 1);
        linkEnter.style("opacity", 1);
    }
//set up simulation of graph
    d3.forceSimulation(data.nodes)
        .force("charge", d3.forceManyBody().strength(-30))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide(d => d.radius))
        .force("link", d3.forceLink(data.links).id(function (d) {
            return d.name;
        }).distance(30).strength(1))
        .on("tick", tickSimulation)
        .force("x", d3.forceX(width / 2).strength(0.2))
        .force("y", d3.forceY(height / 2).strength(0.2));
//create adjacency list so that neighbors can be easily found and accessed
    var adjacencyList = [];

    data.links.forEach(function (d) {
        adjacencyList[d.source.index + "-" + d.target.index] = true;
        adjacencyList[d.target.index + "-" + d.source.index] = true;
    });

    function isNeighbor(a, b) {
        return a == b || adjacencyList[a + "-" + b];
    }
//create graphs & vis containers for display
    var svg = d3.select(containerID).attr("width", width).attr("height", height);
    var container = svg.append("g");
    svg.on("click", normal); //return screen back to normal 
//attach a line to each link
    var linkEnter = container.append("g").attr("class", "links") 
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-width", function(d){
            return (d.value * 2).toString() + "px";
        });
//attach circle to each node and color accordingly
    var nodeEnter = container.selectAll(".nodes")
        .data(data.nodes)
        .enter()
        .append("g")
        .attr("class", "nodes")
        .append("circle")
        .attr("r", (d => d.radius))
        .attr("stroke-width", 0)
        .attr("stroke", "black")
        .attr("fill", function (d) {
            if(d.type == "TV Show"){
                return "#15DF47";
            }else{
                return "#2B9EC0";
            }
        })
//display detail card and neighbors of chosen node when hovered or searched. when clicked, the svg resets back to normal
    nodeEnter.on("mouseover", focus)
    function focus(d, index, source) {
        if(source == "search"){
            nodeEnter.filter(function(p){
                return p.name == d.name;
            }).raise();
        }else{
            d3.select(this).raise();
        }

        let htmlString = "";
        if (d.type == "TV Show"){
            htmlString = `<h1>${d['name']}</h1><h2>Cast: </h2> <p>${d['cast'] ? d['cast'] : "None"}</p><h2>Genre: </h2> <p>${d['genre'] ? d['genre'] : "None"}</p><h2>Plot: </h2> <p>${d['description'] ? d['description'] : "None"}</p>
            `
        } else{
            htmlString = `
                <h1>${d['name']}</h1><h2>TV Show(s): </h2><p> ${d['tvshows'] ? d['tvshows'] : "None"}</p>
            `
        }
        $(detailCard).html(htmlString);

        nodeEnter.select("circle").attr("stroke", 'black').style("stroke-width", function (f) {
            return index == f.index ? "2px" : "0px";
        });

        nodeEnter.style("opacity", function (f) {
            return isNeighbor(index, f.index) ? 1 : 0.1;
        });

        linkEnter.style("opacity", function (f) {
            return f.source.index == index || f.target.index == index ? 1 : 0.1;
        });
    }
//idk what this does but it was in the textbook. I think it establishes the links between nodes
    function tickSimulation() {
        linkEnter
            .attr('x1', function(d) { return d.source.x;})
            .attr('y1', function(d) { return d.source.y;})
            .attr('x2', function(d) { return d.target.x;})
            .attr('y2', function(d) { return d.target.y;});
    
        nodeEnter
            .attr('cx', function(d) { return d.x;})
            .attr('cy', function(d) { return d.y;});
    }

}); 