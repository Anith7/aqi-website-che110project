const apiKey = "b0477a9c9850c9a2d1152a753b50607a17093466";
const openCageKey = "ee64f18484e9400ab9d072d38b5978cf";
const majorCities = ['Mumbai', 'Delhi', 'Kolkata', 'Bengaluru', 'Chennai', 'Paris', 'London', 'New York', 'Tokyo', 'Chandigarh'];

async function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const location = await getCityFromCoordinates(lat, lon);
            if (location) {
                document.getElementById("location-name").textContent = `Your Location: ${location}`;
            } else {
                document.getElementById("location-name").textContent = "Your Location: Location not found";
            }

            const aqiData = await getAQI(lat, lon);
            displayAQI(aqiData, "#current-aqi");

            generateGraph();

            await displayMajorCitiesAQI();
        }, (error) => {
            alert("Unable to retrieve your location. Please enable location services.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

async function getAQI(lat, lon) {
    const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data.aqi;  
}

async function getCityFromCoordinates(lat, lon) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${openCageKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.results && data.results.length > 0) {
        const city = data.results[0].components.city;
        return city || "Location not found"; 
        return null;  
    }
}


function displayAQI(aqi, elementId) {
    const element = document.querySelector(elementId);
    element.textContent = `AQI: ${aqi}`;

    
    if (aqi <= 50) {
        element.style.backgroundColor = "#4caf50";  
        element.style.color = "white";
    } else if (aqi <= 100) {
        element.style.backgroundColor = "#ffeb3b";  
        element.style.color = "black";
    } else if (aqi <= 150) {
        element.style.backgroundColor = "#ff5722";
        element.style.color = "white";
    } else {
        element.style.backgroundColor = "#f44336";  
        element.style.color = "white";
    }
}
document.addEventListener("DOMContentLoaded", function() {
    
    function getRecommendedHour() {
        let currentDate = new Date();
        let startHour, endHour;

       
        if (Math.random() < 0.5) {
            
            startHour = Math.floor(Math.random() * (8 - 5 + 1)) + 5; // 
            endHour = startHour + 1; `Recommended Hour for Outdoor Activity: ${startHour}:00 AM to ${endHour}:00 AM`;
        } else {
            
            startHour = Math.floor(Math.random() * (8 - 5 + 1)) + 5; // 
            endHour = startHour + 1; // Next hour (e.g., 6 PM to 7 PM)
            return `Recommended Hour for Outdoor Activity: ${startHour}:00 PM to ${endHour}:00 PM`;
        }
    }

    
    function displayRecommendedHour() {
        let recommendedHour = getRecommendedHour();
        console.log("Generated Hour: ", recommendedHour);

        let recommendedHourElement = document.getElementById("recommended-hour");
        if (recommendedHourElement) {
            
            setTimeout(() => {
                recommendedHourElement.innerText = recommendedHour;
            }, 3500);
        } else {
            console.error("Error: Element with id 'recommended-hour' not found");
        }
    }

    
    displayRecommendedHour();
});




function generateGraph() {
    const days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString();
    });

    let aqiData = Array(30).fill(0).map(() => Math.floor(Math.random() * 100) + 101); 
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


async function displayMajorCitiesAQI() {
    for (let city of majorCities) {
        const aqi = await getCityAQI(city);
        const cityElement = document.getElementById(city.toLowerCase().replace(' ', '-'));
        const cityAQIElement = cityElement.querySelector('.city-aqi');
        cityAQIElement.textContent = `AQI: ${aqi}`;
        displayCityAQI(aqi, cityAQIElement);
    }
}


async function getCityAQI(city) {
    const url = `https://api.waqi.info/feed/${city}/?token=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data.aqi;
}


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


async function getSearchedCityAQI() {
    const city = document.getElementById("city-search").value.trim();
    if (city) {
        const aqi = await getCityAQI(city);

        
        const cityAQIElement = document.createElement('div');
        cityAQIElement.classList.add('city-aqi');
        cityAQIElement.textContent = `${city} AQI: ${aqi}`;

        
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

        
        document.getElementById("searched-city").innerHTML = ''; 
        document.getElementById("searched-city").appendChild(cityAQIElement);
    }
}


window.onload = () => {
    getUserLocation();
};
