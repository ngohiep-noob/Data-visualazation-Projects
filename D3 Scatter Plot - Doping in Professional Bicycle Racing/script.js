const h = 550, w = 950,padding = 70, url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
const svg = d3.select('#main')
            .append('svg')
            .attr('height', h)
            .attr('width', w)

fetch(url)
.then(res => res.json()) 
.then(data => {
    const dataset = data;

    const xScale = d3.scaleTime()
                    .domain([new Date((d3.min(dataset,d => d.Year) - 1).toString()),new Date((d3.max(dataset,d => d.Year) + 1).toString())])
                    .range([padding, w - 20])
    
    const yScale = d3.scaleTime()
                    .domain([new Date(`1969-12-31 16:${d3.min(dataset,d => d.Time)}`), new Date(`1969-12-31 16:${d3.max(dataset,d => d.Time)}`)])
                    .range([padding * 1.2, h - 30])

    var timeFor = d3.timeFormat('%M:%S')

    const dots = svg.selectAll('circle')
                    .data(dataset)
                    .enter()
                    .append('circle')
                    .attr('cx', d => {    
                        return xScale(new Date(d.Year.toString()))
                    })
                    .attr('cy', d => {
                        return yScale(new Date(`1969-12-31 16:${d.Time}`))
                    })
                    .attr('r', 5)
                    .attr('fill', d => {
                        if(d.Doping) {
                            return '#81ecec'
                        }
                        return '#e17055'
                    })
                    .attr('class', 'dot')
                    .attr('data-xvalue', d => d.Year)
                    .attr('data-yvalue', d => new Date(`1969-12-31 16:${d.Time}`).toISOString())
                    .attr('index', d => d.Place - 1)

    dots.on('mouseover', e => {
        //0 : cx
        //1 : cy
        //7 : index
        const x = parseInt(e.target.attributes[0].nodeValue) + 10,
            y = parseInt(e.target.attributes[1].nodeValue) - 40,
            detail = dataset[e.target.attributes[7].nodeValue],
            elem = document.getElementById('tooltip');
        
        elem.setAttribute('data-year', detail.Year)
        elem.innerHTML = `
        ${detail.Name}, ${detail.Nationality} <br>
        Year: ${detail.Year}, Time: ${detail.Time} 
        <br>
        ${detail.Doping}
        `
        elem.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            opacity: 0.8;
        `
        e.target.style.opacity = 1
        
    })
    
    dots.on('mouseout', e => {
        elem = document.getElementById('tooltip');
        elem.innerHTML = ''
        elem.style.cssText = `
            opacity: 0;
        `
        e.target.style.opacity = 0.8
    })

    const xAxis = d3.axisBottom()
                    .scale(xScale)

    svg.append('g')
        .attr('transform', 'translate(0,' + (h - 30) + ')')
        .attr('id', 'x-axis')
        .call(xAxis)

    const yAxis = d3.axisLeft()
                    .scale(yScale)
                    .tickFormat(timeFor);
    svg.append('g')
        .attr('transform', 'translate(' + padding + ',0)')
        .attr('id', 'y-axis')
        .call(yAxis)

    //tooltip
    d3.select('#main')
    .append('div')
    .attr('id','tooltip')

    //title
    svg.append('text')
        .text('Doping in Professional Bicycle Racing')
        .attr('y', 25)
        .attr('x', '50%')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('id', 'title')
        .style('font-size', 30)

    svg.append('text')
        .text('35 Fastest times up Alpe d\'Huez')
        .attr('y', 55)
        .attr('x', '50%')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', 20)

    svg.append('text')
        .text('Time in Minutes')
        .attr('y', 25)
        .attr('x', -270)
        .attr('transform', 'rotate(-90)')
        .style('font-size', 20)

    //Annotation

    var legend = svg.append('g').attr('id', 'legend')

    legend.append('rect')
        .attr('x', w - 40)
        .attr('y', '45%')
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', '#e17055')
    legend.append('text')
        .attr('x', w - 45)
        .attr('y', '47%')
        .text('No doping allegations')
        .style('text-anchor', 'end')
        .style('font-size', 13)

    legend.append('rect')
        .attr('x', w - 40)
        .attr('y', '50%')
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', '#81ecec')
    legend.append('text')
        .attr('x', w - 45)
        .attr('y', '52%')
        .text('Riders with doping allegations')
        .style('text-anchor', 'end')
        .style('font-size', 13)
})
