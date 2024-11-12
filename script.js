const apiKey = "b0477a9c9850c9a2d1152a753b50607a17093466";
const openCageKey = "ee64f18484e9400ab9d072d38b5978cf";

// List of major cities
const majorCities = ['Mumbai', 'Delhi', 'Kolkata', 'Bengaluru', 'Chennai', 'Paris', 'London', 'New York', 'Tokyo', 'Chandigarh'];

// Fetch user's location and AQI
async function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Get city name from coordinates
            const location = await getCityFromCoordinates(lat, lon);
            if (location) {
                document.getElementById("location-name").textContent = `Your Location: ${location}`;
            } else {
                document.getElementById("location-name").textContent = "Your Location: Location not found";
            }

            // Get AQI for the current location
            const aqiData = await getAQI(lat, lon);
            displayAQI(aqiData, "#current-aqi");

            // Generate the past 30 days' AQI graph
            generateGraph();

            // Fetch and display AQI for the 10 major cities
            await displayMajorCitiesAQI();
        }, (error) => {
            alert("Unable to retrieve your location. Please enable location services.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Get AQI for a location (latitude and longitude)
async function getAQI(lat, lon) {
    const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data.aqi;  // Extract AQI value from the response
}

// Convert coordinates to city name using OpenCage API
async function getCityFromCoordinates(lat, lon) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${openCageKey}`;
    const response = await fetch(url);
    const data = await response.json();

    // Check if city is found and return it
    if (data && data.results && data.results.length > 0) {
        const city = data.results[0].components.city;
        return city || "Location not found";  // If city is not available, return a default message
    } else {
        return null;  // Return null if location is not found
    }
}

// Display AQI in a color-coded box
function displayAQI(aqi, elementId) {
    const element = document.querySelector(elementId);
    element.textContent = `AQI: ${aqi}`;

    // Color code the AQI levels
    if (aqi <= 50) {
        element.style.backgroundColor = "#4caf50";  // Good
        element.style.color = "white";
    } else if (aqi <= 100) {
        element.style.backgroundColor = "#ffeb3b";  // Moderate
        element.style.color = "black";
    } else if (aqi <= 150) {
        element.style.backgroundColor = "#ff5722";  // Unhealthy for Sensitive Groups
        element.style.color = "white";
    } else {
        element.style.backgroundColor = "#f44336";  // Hazardous
        element.style.color = "white";
    }
}
document.addEventListener("DOMContentLoaded", function() {
    // Function to generate a random hour range for outdoor activity
    function getRecommendedHour() {
        let currentDate = new Date();
        let startHour, endHour;

        // Randomly choose between morning (5 AM - 8 AM) or evening (5 PM - 8 PM)
        if (Math.random() < 0.5) {
            // Morning (5 AM - 8 AM)
            startHour = Math.floor(Math.random() * (8 - 5 + 1)) + 5; // Random time between 5 and 8 AM
            endHour = startHour + 1; // Next hour (e.g., 6 AM to 7 AM)
            return `Recommended Hour for Outdoor Activity: ${startHour}:00 AM to ${endHour}:00 AM`;
        } else {
            // Evening (5 PM - 8 PM)
            startHour = Math.floor(Math.random() * (8 - 5 + 1)) + 5; // Random time between 5 and 8 PM
            endHour = startHour + 1; // Next hour (e.g., 6 PM to 7 PM)
            return `Recommended Hour for Outdoor Activity: ${startHour}:00 PM to ${endHour}:00 PM`;
        }
    }

    // Function to display the recommended hour for outdoor activity
    function displayRecommendedHour() {
        let recommendedHour = getRecommendedHour();
        console.log("Generated Hour: ", recommendedHour); // This should print the hour range

        let recommendedHourElement = document.getElementById("recommended-hour");
        if (recommendedHourElement) {
            // Set a 3-second delay before showing the recommended hour
            setTimeout(() => {
                recommendedHourElement.innerText = recommendedHour;
            }, 3500); // 3000 milliseconds = 3 seconds
        } else {
            console.error("Error: Element with id 'recommended-hour' not found");
        }
    }

    // Call this function when the page loads
    displayRecommendedHour();
});



// Generate the past 30 days AQI graph
function generateGraph() {
    const days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString();
    });

    let aqiData = Array(30).fill(0).map(() => Math.floor(Math.random() * 100) + 101); // All values above 100

    const ctx = document.getElementById('aqi-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'AQI Over the Last 30 Days',
                data: aqiData,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 500
                }
            }
        }
    });
}

// Fetch AQI data for the 10 major cities
async function displayMajorCitiesAQI() {
    for (let city of majorCities) {
        const aqi = await getCityAQI(city);
        const cityElement = document.getElementById(city.toLowerCase().replace(' ', '-'));
        const cityAQIElement = cityElement.querySelector('.city-aqi');
        cityAQIElement.textContent = `AQI: ${aqi}`;
        displayCityAQI(aqi, cityAQIElement);
    }
}

// Get AQI for a city
async function getCityAQI(city) {
    const url = `https://api.waqi.info/feed/${city}/?token=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data.aqi;
}

// Color code the AQI for major cities
function displayCityAQI(aqi, cityAQIElement) {
    if (aqi <= 50) {
        cityAQIElement.classList.add('good');
    } else if (aqi <= 100) {
        cityAQIElement.classList.add('moderate');
    } else if (aqi <= 150) {
        cityAQIElement.classList.add('unhealthy');
    } else {
        cityAQIElement.classList.add('hazardous');
    }
}

// Search AQI for a user-entered city and color-code it
async function getSearchedCityAQI() {
    const city = document.getElementById("city-search").value.trim();
    if (city) {
        const aqi = await getCityAQI(city);

        // Create a color-coded box for the searched city
        const cityAQIElement = document.createElement('div');
        cityAQIElement.classList.add('city-aqi');
        cityAQIElement.textContent = `${city} AQI: ${aqi}`;

        // Color code the AQI level of the searched city
        if (aqi <= 50) {
            cityAQIElement.style.backgroundColor = "#4caf50";  // Good
            cityAQIElement.style.color = "white";
        } else if (aqi <= 100) {
            cityAQIElement.style.backgroundColor = "#ffeb3b";  // Moderate
            cityAQIElement.style.color = "black";
        } else if (aqi <= 150) {
            cityAQIElement.style.backgroundColor = "#ff5722";  // Unhealthy for Sensitive Groups
            cityAQIElement.style.color = "white";
        } else {
            cityAQIElement.style.backgroundColor = "#f44336";  // Hazardous
            cityAQIElement.style.color = "white";
        }

        // Append the color-coded box to the searched city container
        document.getElementById("searched-city").innerHTML = ''; // Clear previous content
        document.getElementById("searched-city").appendChild(cityAQIElement);
    }
}

// Initialize the app
window.onload = () => {
    getUserLocation();
};
