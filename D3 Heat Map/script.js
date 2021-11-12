const URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json', w = 1300, h = 538, padding = 70;

const heading = d3.select('body')
                    .append('heading')
                    .attr('id', 'heading')

heading.append('h1')
        .text('Monthly Global Land-Surface Temperature')
        .attr('id','title')
const tempColor = [
    '#484ef7',
    '#48d7f7',
    '#a2fcfc',
    '#d4ffff',
    '#f7f492',
    '#fde190',
    '#fdae62',
    '#f46d42',
    '#d83025'
]
const svg = d3.select('#main')
            .append('svg')
            .attr('height', h)
            .attr('width', w)  
fetch(URL)
.then(json => json.json())
.then(data => {    
    const dataset = data.monthlyVariance;
    const baseTemp = data.baseTemperature;
    heading.append('h3')
            .text(`1753 - 2015: base temperature ${baseTemp}℃`)
            .attr('id', 'description')
    const halfMonthToPixel = (h - padding) / 24
    const yScale = d3.scaleLinear()
                    .domain([0, 12])
                    .range([0, h - padding])
    const yAxis = d3.axisLeft()
                    .scale(yScale)
                    .tickFormat((month) => {
                        var date = new Date(0);
                        date.setUTCMonth(month)
                        return d3.timeFormat('%B')(date)
                    })
                    .tickSizeOuter(0)
                    
    const yLine = svg.append('g')
                    .attr('transform', 'translate(' + padding + ',0)')
                    .attr('id', 'y-axis')
                    .call(yAxis)

    yLine.selectAll('g')
        .attr('transform', (e, i) => {
            return 'translate(0,' + (halfMonthToPixel + halfMonthToPixel * 2 * i) + ')';
        })
    yLine.select('.tick:last-of-type').remove()

    const xScale = d3.scaleLinear()
                        .domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year) + 1])
                        .range([0, w - padding - 10])
    
    const xAxis = d3.axisBottom()
                    .scale(xScale)
                    .tickSizeOuter(0)
                    .tickFormat(num => num)
                    .ticks(20)

    const xLine = svg.append('g')
                    .attr('transform', 'translate(' + padding + ','+ (h - padding) + ')')
                    .attr('id', 'x-axis')
                    .call(xAxis)

    const sevenYearToPx = xScale(1760) - xScale(1753)
    const tenYearToPx = xScale(1780) - xScale(1770)
    const hCell = 39, wCell = (w - padding - 10) / 262;

    xLine.selectAll('g')
        .attr('transform', (e, i) => {
            return 'translate(' + (sevenYearToPx + i * tenYearToPx + wCell / 2) + ',0)'
        })
    const colorScale = d3.scaleThreshold()
                    .domain([3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7])
                    .range(tempColor)
    const map = svg.append('g')
                    .attr('class', 'map')
    d3.select('#main')
        .append('div')
        .attr('class', 'tooltip')
        .attr('id', 'tooltip')

    svg.append('text')
    .text('Months')
    .attr('transform', 'rotate(-90)')
    .attr('x', '-17%')
    .attr('y',15)
    .attr('style','font-size: 20px')

    svg.append('text')
        .text('Years')
        .attr('x', '70%')
        .attr('y', '97%')
        .attr('style','font-size: 20px')

    const cells = map.selectAll('rect')
                    .data(dataset)
                    .enter()
                    .append('rect')
                    .attr('height', hCell)
                    .attr('width', wCell)
                    .attr('x', d => xScale(d.year) + padding)
                    .attr('y', d => yScale(d.month) - halfMonthToPixel * 2)
                    .attr('data-year', d => d.year)
                    .attr('data-month', d => d.month - 1)
                    .attr('data-temp', d => (d.variance).toFixed(1))
                    .attr('class', 'cell')
                    .attr('fill',d => colorScale((baseTemp + d.variance).toFixed(1)))

    const colorAxisScale = d3.scalePoint()
                        .domain([2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8])
                        .range([0, 320])
 
    const legend = svg.append('g')
                    .attr('class', 'legend')
                    .attr('id', 'legend')

    const colorAxis = d3.axisBottom()
                        .scale(colorAxisScale)
    legend.append('g')
        .attr('transform', 'translate(' + (padding + 30) + ', ' + (h - 20) + ')')
        .call(colorAxis)
    const colorCells = legend.selectAll('rect')
                        .data(tempColor)
                        .enter()
                        .append('rect')
                        .attr('fill', e => e)
                        .attr('width', 320 / 9)
                        .attr('height', 25)
                        .attr('y', h - 45)
                        .attr('x', (e, i) => {
                            return padding + 30 + i * 320 / 9
                        })

    cells.on('mouseover', e => {
        // 0: height
        // 1: width
        // 2: x
        // 3: y
        // 4: year
        // 5: month
        const x = e.target.attributes[2].nodeValue
        const y = e.target.attributes[3].nodeValue
        const dataMon = e.target.attributes[5].nodeValue
        const date = new Date()
        date.setMonth(parseInt(dataMon))
        const stringMon = date.toLocaleString('en-US', { month: 'long'})
        const dataYear = e.target.attributes[4].nodeValue
        const dataTemp = e.target.attributes[6].nodeValue
        const toolTip = document.getElementsByClassName('tooltip')
        toolTip[0].setAttribute('data-year', dataYear)
        toolTip[0].innerHTML = `
            ${dataYear} - ${stringMon} <br>
            ${(baseTemp + parseFloat(dataTemp)).toFixed(1)}℃ <br>
            ${parseFloat(dataTemp).toFixed(1) > 0 ? '+' + parseFloat(dataTemp).toFixed(1) : parseFloat(dataTemp).toFixed(1)}℃
        `
        toolTip[0].style.cssText = `
            display: flex;
            top: ${y - 90}px;
            left: ${x - 50}px;
        `
        
    })

    cells.on('mouseout', e => {
        const toolTip = document.getElementsByClassName('tooltip')
        toolTip[0].style.cssText = `
            display: none;
        `
    })
})

