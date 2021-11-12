const h = 450, w = 955, padding = 50, url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';
const svg = d3.select('#main')
            .append('svg')
            .attr('height', h)
            .attr('width', w)

const request = new XMLHttpRequest();
request.open('GET', url, true)
request.send();
request.onload = () => {
    const dataset = JSON.parse(request.responseText).data;
    
    
    const yScaleAxis = d3.scaleLinear()
        .domain([0, d3.max(dataset)[1]])
        .range([h - padding, 0]);
    
    const interval = yScaleAxis.ticks()[1] - yScaleAxis.ticks()[0]

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(dataset)[1]])
        .range([0, h - padding]);
    
    var xMax = new Date(d3.max(dataset)[0]);
    xMax.setMonth(xMax.getMonth() + 3);
    console.log(xMax)
    const xScaleAxis = d3
        .scaleTime()
        .domain([new Date(d3.min(dataset)[0]), xMax])
        .range([padding, dataset.length * 3.1 + padding])


    const bars = svg.selectAll('react')
                    .data(dataset)
                    .enter()
                    .append('rect')
                    .attr("x", (d, i) => (i * 3.1) + padding)
                    .attr("y", d => (h - yScale(d[1]) - padding))
                    .attr("width", 3)
                    .attr("height", d => yScale(d[1]))
                    .attr('fill', '#1abc9c')
                    .attr('class', 'bar')
                    .attr('data-gdp', d => d[1])
                    .attr('data-date', d => d[0])
    
    bars.on('mouseover', (e) => {
        //6: GDP
        //7: date
        const gdpValue = e.target.attributes[6].nodeValue;
        const dateValue = e.target.attributes[7].nodeValue,
                dataMonth = dateValue[6],
                dataYear = dateValue.substring(0, 4);
        let quarter = ''
        switch(dataMonth) {
            case '1':
                quarter = 'Q1'
                break;
            case '4':
                quarter = 'Q2'
                break;
            case '7':
                quarter = 'Q3'
                break;
            case '0':
                quarter = 'Q4'
                break;
        }
        const elem = document.getElementById('tooltip');
        elem.setAttribute('data-date', dateValue)
        elem.innerHTML = `${dataYear} ${quarter} <br> \$${gdpValue} Billion`
        // elem.setAttribute('style', `left: ${parseInt(e.target.attributes[0].nodeValue) + 20}px`)
        elem.style.cssText = `
            left: ${parseInt(e.target.attributes[0].nodeValue) + 20}px;
            opacity: 1;
        `
    })

    bars.on('mouseout', () => {
        document.getElementById('tooltip').style.cssText = 'opacity: 0'
        document.getElementById('tooltip').removeAttribute('data-date')
    })

    const yAxis = d3.axisLeft(yScaleAxis);

    svg.append('g')
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + padding + ',0)')
        .call(yAxis);
    
    const xAxis = d3.axisBottom(xScaleAxis);

    svg.append('g')
        .attr('id', 'x-axis')
        .attr('transform', 'translate(0,' + (h - padding) + ')')
        .call(xAxis);

    svg.append('text')
        .text('Gross Domestic Product')
        .attr('x', -230)
        .attr('y', 75)
        .attr('transform', 'rotate(-90)')

    svg.append('text')
        .text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf')
        .attr('x', padding * 11)    
        .attr('y', h - 10)    
        .attr('class', 'detail')
}


