const CountyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json',
EducationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json', w = 960, h = 600;

//heading 
const heading = d3.select('.main');

heading.append('h1')
    .text('United States Education Attainment')
    .attr('id', 'title')
heading.append('div')
    .text('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)')
    .attr('id', 'description')

const path = d3.geoPath();

const svg = d3.select('.main')
            .append('svg')
            .attr('width', w)
            .attr('height', h)

const map = svg.append('g')
            .attr('class', 'map')

Promise.all([
    fetch(CountyURL),
    fetch(EducationURL)
])
.then(res => res.map(r => r.json()))
.then(data => {  
    data[0].then(r => {
        localStorage.setItem('countyData', JSON.stringify(r))
    })
    data[1].then(r => {
        localStorage.setItem('eduData', JSON.stringify(r))
    })
})
const county = JSON.parse(localStorage.getItem('countyData')),
education = JSON.parse(localStorage.getItem('eduData'));

const geojson = topojson.feature(county, county.objects.counties)

const tooltip = d3.select('.main')
                .append('div')
                .attr('id', 'tooltip')

const colorScale = d3.scaleThreshold()
                    .domain([3, 12, 21, 30, 39, 48, 57, 66])
                    .range(d3.schemeGreens[9]);

map.selectAll('path')
    .data(geojson.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('class', 'county')
    .attr('data-fips', d => d.id)
    .attr('data-education', d => {
        var res = education.filter(obj => {
            return obj.fips == d.id
        })    
        if(res[0]) {       
            return res[0].bachelorsOrHigher
        }
    })
    .attr('fill', d => {
        var res = education.filter(obj => {
            return obj.fips == d.id
        })
        if(res[0]) {
            return colorScale(res[0].bachelorsOrHigher)
        }
    })
    .on('mouseover', d => {
        const id = d.target.attributes[2].nodeValue
        var res = education.filter(e => {
            return e.fips == id;
        })
        const toolTipCard = document.getElementById('tooltip')
        if(res[0]) {
            toolTipCard.innerText = `${res[0].area_name}, ${res[0].state}: ${res[0].bachelorsOrHigher}%`
        } else {
            console.log('get data failed')
        }
        toolTipCard.setAttribute('data-education', res[0].bachelorsOrHigher)
        toolTipCard.style.cssText = `
            left: ${d.clientX + 10}px;
            top: ${d.clientY - 10}px;
            opacity: 1;
        `
    })
    .on('mouseout', d => {
        const toolTipCard = document.getElementById('tooltip')
        toolTipCard.style.cssText = `
            top: 0;
            left: 0;
            opacity: 0;
            cursor: none;
        `
    })

const legend = svg.append('g')
                .attr('class', 'legend')
                .attr('id', 'legend')

const scaleAxis = d3.scalePoint()
                    .domain([3, 12, 21, 30, 39, 48, 57, 66])
                    .range([0, 250])

const colorScaleAxis = d3.axisBottom()
                        .scale(scaleAxis)
                        .tickFormat(x => `${x}%`)

const colorLine = legend.append('g')
                    .attr('transform', 'translate(600, 30)')
                    .attr('class', 'legend')
                    .call(colorScaleAxis)

colorLine.select('path').remove()
const scaleColorRuler = d3.scaleLinear()
                        .domain([3, 66])
                        .range([0, 250])
colorLine.selectAll('g')
        .select('line')
        .attr('y2', 15)
        
colorLine.selectAll('g')
        .select('text')
        .attr('y', 19)

legend.selectAll('rect')
        .data(d3.schemeGreens[7])
        .enter()
        .append('rect')
        .attr('fill', e => e)
        .attr('x', (e, i) => {
            return scaleColorRuler(3 + 9 * i) + 600;
        })
        .attr('y', 30)
        .attr('width', 250 / 7)
        .attr('height', 10)

svg.append('path')
    .datum(
        topojson.mesh(county, county.objects.states, (a, b) => {
            return a != b
        })
    )
    .attr('class', 'states')
    .attr('d', path)


