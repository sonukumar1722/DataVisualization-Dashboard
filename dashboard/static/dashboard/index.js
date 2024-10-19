document.addEventListener('DOMContentLoaded', function () {
    // Event listener for the SWOT filter dropdown change
    document.getElementById('swotFilter').addEventListener('change', function () {
        const selectedSWOT = this.value;
        fetchData(selectedSWOT);
    });

    // Function to fetch data based on selected SWOT filter
    function fetchData(selectedSWOT) {
        const url = selectedSWOT ? `/api/data?swot=${selectedSWOT}` : '/api/data';
        fetch(url)
            .then(response => response.json())
            .then(data => {
                updateDashboard(data);  // Update the dashboard with the fetched data
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // Function to update the dashboard visualizations with the new data
    function updateDashboard(data) {
        // Logic to update dashboard visuals will go here
    }

    // Elements for filters
    const endYearFilter = document.getElementById('endYearFilter');
    const topicFilter = document.getElementById('topicFilter');
    const sectorFilter = document.getElementById('sectorFilter');
    const regionFilter = document.getElementById('regionFilter');
    const pestFilter = document.getElementById('pestFilter');
    const sourceFilter = document.getElementById('sourceFilter');
    const swotFilter = document.getElementById('swotFilter');
    const countryFilter = document.getElementById('countryFilter');
    const cityFilter = document.getElementById('cityFilter');
    const applyFiltersButton = document.getElementById('applyFilters');

    // Load filter options and default data on page load
    loadFilterOptions();
    fetchDefaultData();

    // Event listener for applying filters
    applyFiltersButton.addEventListener('click', fetchFilteredData);
});

// Render all charts based on the provided data
function renderAllCharts(data) {
    renderBubbleChart(data);
    renderBarChartRelevance(data);
    renderTopCountriesByImpact(data);
    renderSmoothLineChart(data); // Histogram (e.g., Intensity distribution)
    renderDonutChart(data); // Line chart (e.g., Likelihood over Year)
    renderBarChart(data); // Bar chart (e.g., Intensity by Topic)
    renderDistDonutChart(data); // Pie chart (e.g., Distribution by Region)
    renderScatterPlot(data); // Scatter plot (e.g., Intensity vs Relevance)
}

// Fetch default data and render charts
function fetchDefaultData() {
    // Show loading spinner (uncomment the line below if needed)
    // document.getElementById('loadingSpinner').style.display = 'flex';
    fetch('/api/data/')
        .then(response => response.json())
        .then(data => {
            // Hide loading spinner (uncomment the line below if needed)
            // document.getElementById('loadingSpinner').style.display = 'none';
            updateKPIs(data); // Update KPI cards
            renderAllCharts(data); // Render all charts
            populateDataTable(data); // Populate the data table
        })
        .catch(error => {
            // Hide loading spinner in case of error (uncomment the line below if needed)
            // document.getElementById('loadingSpinner').style.display = 'none';
            console.error('Error fetching default data:', error);
        });
}

// Load available filter options (populate dropdowns)
function loadFilterOptions() {
    fetch('/api/data/')
        .then(response => response.json())
        .then(data => {
            populateFilterOptions(data, 'end_year', endYearFilter);
            populateFilterOptions(data, 'topic', topicFilter);
            populateFilterOptions(data, 'sector', sectorFilter);
            populateFilterOptions(data, 'region', regionFilter);
            populateFilterOptions(data, 'pestle', pestFilter);
            populateFilterOptions(data, 'source', sourceFilter);
            populateFilterOptions(data, 'swot', swotFilter); // Assuming SWOT filter is available in the data
            populateFilterOptions(data, 'country', countryFilter);
            populateFilterOptions(data, 'city', cityFilter);
        });
}

// Helper function to populate dropdowns with unique values from the data
function populateFilterOptions(data, key, element) {
    // Extract unique values from the data
    const uniqueValues = [...new Set(data.map(d => d[key]).filter(Boolean))];

    // Separate strings and numbers
    const stringValues = uniqueValues.filter(value => isNaN(value));
    const numberValues = uniqueValues.filter(value => !isNaN(value)).map(Number); // Convert to numbers

    // Sort string values alphabetically and number values numerically
    stringValues.sort();
    numberValues.sort((a, b) => a - b); // Numeric sort

    // Combine sorted string and number values
    const sortedValues = [...stringValues, ...numberValues];

    // Populate the dropdown with sorted values
    sortedValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        element.appendChild(option);
    });
}

// Apply filters and fetch filtered data
function fetchFilteredData() {
    const filters = {
        end_year: endYearFilter.value,
        topic: topicFilter.value,
        sector: sectorFilter.value,
        region: regionFilter.value,
        pestle: pestFilter.value,
        source: sourceFilter.value,
        swot: swotFilter.value,
        country: countryFilter.value,
        city: cityFilter.value
    };
    const queryString = buildQueryString(filters);

    fetch(`/api/data/filtered/${queryString}`)
        .then(response => response.json())
        .then(data => {
            renderAllCharts(data);
            updateKPIs(data); // Update KPI cards
            populateDataTable(data); // Populate the data table
        })
        .catch(error => console.error('Error fetching filtered data:', error));
}

// Build query string for API call based on filters
function buildQueryString(filters) {
    const params = new URLSearchParams(filters);
    return params.toString() ? `?${params.toString()}` : '';
}

// Update KPIs based on the fetched data
function updateKPIs(data) {
    console.log('Update KPI is called successfully!');
    console.log(data[0]);
    const totalEntries = data.length;
    const avgLikelihood = (data.reduce((acc, curr) => acc + (curr.likelihood || 0), 0) / totalEntries).toFixed(2);
    const avgIntensity = (data.reduce((acc, curr) => acc + (curr.intensity || 0), 0) / totalEntries).toFixed(2);
    const totalRegions = new Set(data.map(d => d.region)).size;

    document.getElementById('totalEntries').textContent = totalEntries;
    document.getElementById('avgLikelihood').textContent = avgLikelihood;
    document.getElementById('avgIntensity').textContent = avgIntensity;
    document.getElementById('totalRegions').textContent = totalRegions;
}

// Populate the data table with the fetched data
function populateDataTable(data) {
    const tableBody = document.getElementById('dataTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    data.forEach(d => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${d.end_year || 'N/A'}</td>
            <td>${d.topic || 'N/A'}</td>
            <td>${d.region || 'N/A'}</td>
            <td>${d.intensity || 'N/A'}</td>
            <td>${d.likelihood || 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to render bubble chart
function renderBubbleChart(data) {
    const xValues = data.map(d => d.impact || 0);
    const yValues = data.map(d => d.likelihood || 0);
    const bubbleSize = data.map(d => d.relevance || 1); // Use relevance for bubble size
    const sectors = data.map(d => d.sector || 'Unknown');

    const trace = {
        x: xValues,
        y: yValues,
        text: sectors, // Display sector name on hover
        mode: 'markers',
        marker: {
            size: bubbleSize,
            color: data.map(d => d.intensity || 0),
            colorscale: 'Portland',
            showscale: true
        }
    };

    const layout = {
        xaxis: { title: 'Impact' },
        yaxis: { title: 'Likelihood' },
        hovermode: 'closest'
    };

    Plotly.newPlot('bubbleChart', [trace], layout);
}

// Function to render bar chart for relevance over time
function renderBarChartRelevance(data) {
    const yearCounts = {};

    data.forEach(d => {
        const year = d.end_year || d.start_year || 'N/A';
        if (year <= 2024 && yearCounts[year]) {
            yearCounts[year] += d.relevance || 0; // Summing relevance over the years
        } else if (year <= 2024) {
            yearCounts[year] = d.relevance || 0;
        }
    });

    const xValues = Object.keys(yearCounts);
    const yValues = Object.values(yearCounts);

    const trace = {
        x: xValues,
        y: yValues,
        type: 'bar',
        marker: { color: 'blue' }
    };

    const layout = {
        xaxis: { title: 'Year' },
        yaxis: { title: 'Total Relevance' }
    };

    Plotly.newPlot('barChartRelevance', [trace], layout);
}

// Function to render top countries by impact
function renderTopCountriesByImpact(data) {
    // Aggregate data by country
    const countryImpact = {};
    data.forEach(d => {
        const country = d.country || 'Unknown';
        if (countryImpact[country]) {
            countryImpact[country] += d.impact || 0;
        } else {
            countryImpact[country] = d.impact || 0;
        }
    });

    // Get the top 5 countries by impact
    const topCountries = Object.entries(countryImpact)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const xValues = topCountries.map(d => d[0]);
    const yValues = topCountries.map(d => d[1]);

    const trace = {
        x: xValues,
        y: yValues,
        type: 'bar',
        marker: { color: 'orange' }
    };

    const layout = {
        xaxis: { title: 'Country' },
        yaxis: { title: 'Impact' },
    };

    Plotly.newPlot('barChartCountries', [trace], layout);
}

// Function to render donut chart for likelihood distribution by topic
function renderDonutChart(data) {
    const likelihoodCounts = {};

    data.forEach(d => {
        const likelihood = d.likelihood || 'Unknown';
        if (likelihoodCounts[likelihood]) {
            likelihoodCounts[likelihood]++;
        } else {
            likelihoodCounts[likelihood] = 1;
        }
    });

    const labels = Object.keys(likelihoodCounts);
    const values = Object.values(likelihoodCounts);

    const trace = {
        labels: labels,
        values: values,
        type: 'pie',
        hole: 0.4, // Creates a donut chart
        marker: { colors: ['#ff9999', '#66b3ff', '#99ff99', '#ffcc99'] }
    };

    const layout = {
        showlegend: true
    };

    Plotly.newPlot('donutChart', [trace], layout);
}

// Function to render bar chart for intensity by topic
function renderBarChart(data) {
    const xValues = data.map(d => d.topic || 'Unknown');
    const yValues = data.map(d => d.intensity);

    const trace = {
        x: xValues,
        y: yValues,
        type: 'bar',
        marker: { color: 'orange' }
    };

    const layout = {
        xaxis: { title: 'Topic' },
        yaxis: { title: 'Intensity' }
    };

    Plotly.newPlot('barChart', [trace], layout);
}

// Function to render donut chart for distribution by region
function renderDistDonutChart(data) {
    const regionCounts = {};

    // Count occurrences of each region
    data.forEach(d => {
        const region = d.region || 'Unknown';
        if (regionCounts[region]) {
            regionCounts[region]++;
        } else {
            regionCounts[region] = 1; // Initialize if not present
        }
    });

    const labels = Object.keys(regionCounts);
    const values = Object.values(regionCounts);

    const trace = {
        labels: labels,
        values: values,
        type: 'pie',
        hole: 0.4, // Makes it a donut chart
        marker: { colors: ['#007bff', '#28a745', '#ffcc00', '#ff6f61', '#6a1b9a', '#5d4037', '#ff9800'] },
        textinfo: 'label+percent', // Show label and percentage
        textposition: 'inside',
    };

    const layout = {
        showlegend: true,
        annotations: [
            {
                text: 'Regions',
                font: {
                    size: 20,
                    weight: 'bold',
                    color: '#ffffff'
                },
                showarrow: false,
                x: 0.5,
                y: 0.5
            }
        ],
        margin: { l: 50, r: 50, t: 50, b: 50 },
        paper_bgcolor: '#ffffff', // Match dashboard background color
        plot_bgcolor: '#ffffff' // White background for the plot
    };

    Plotly.newPlot('DistdonutChart', [trace], layout);
}

// Function to render scatter plot (Intensity vs Relevance)
function renderScatterPlot(data) {
    const xValues = data.map(d => d.intensity);
    const yValues = data.map(d => d.relevance);

    const trace = {
        x: xValues,
        y: yValues,
        mode: 'markers',
        marker: {
            size: 10,
            color: data.map(d => d.likelihood), // Color by likelihood
            colorscale: 'Viridis'
        },
        type: 'scatter'
    };

    const layout = {
        xaxis: { title: 'Intensity' },
        yaxis: { title: 'Relevance' }
    };

    Plotly.newPlot('scatterPlot', [trace], layout);
}

// Function to render histogram (Intensity Distribution)
function renderSmoothLineChart(data) {
    const intensityValues = data.map(d => d.intensity).filter(Boolean); // Ensure valid intensity values

    // Count occurrences of each intensity value
    const intensityCounts = {};
    intensityValues.forEach(value => {
        intensityCounts[value] = (intensityCounts[value] || 0) + 1;
    });

    // Prepare x and y values
    const xValues = Object.keys(intensityCounts).map(Number); // Intensity values
    const yValues = Object.values(intensityCounts); // Count occurrences

    // Set up dimensions and margins
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select("#d3Chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(xValues))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(yValues)])
        .range([height, 0]);

    // Define the area
    const area = d3.area()
        .x((d, i) => xScale(xValues[i]))
        .y0(height) // Fill starts at the bottom
        .y1(d => yScale(d));

    // Create a gradient
    const gradient = svg.append("defs").append("linearGradient")
        .attr("id", "gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", 0) // Gradient starts at the top
        .attr("x2", 0).attr("y2", height); // Gradient ends at the bottom

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "rgba(0, 100, 250, 1)"); // Solid blue at the top

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(0, 100, 250, 0)"); // Transparent at the bottom

    // Draw the area with the gradient
    svg.append("path")
        .datum(yValues) // Bind data
        .attr("fill", "url(#gradient)") // Use gradient fill
        .attr("d", area); // Draw area

    // Define the line with smooth curve
    const line = d3.line()
        .x((d, i) => xScale(xValues[i]))
        .y(d => yScale(d))
        .curve(d3.curveBasis); // Apply smooth curve

    // Draw the line
    svg.append("path")
        .datum(yValues)
        .attr("fill", "none")
        .attr("stroke", "rgba(0, 100, 250, 1)") // Line color
        .attr("stroke-width", 2)
        .attr("d", line); // Draw line

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));
}
