// console.log("Heloo jee");
const API_KEY = "80df664c85330314286c07263b3efd8b";
// function renderWeatherInfo(data) {
//     let newPara = document.createElement('p');
//     newPara.textContent = `${data?.main?.temp.toFixed(2)} C`;
//     document.body.appendChild(newPara);
// }
// async function getWeather() {
//     let city = "khandwa";
//     const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
//     const data = await response.json();
//     console.log("Weather data:-> ",data);
//     renderWeatherInfo(data);
// }

// async function getWeather2() {
//     let lat = 21.83333;
//     let lon = 76.5666;
//     const result = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
//     const data = await result.json();
//     console.log("Weather data:-> ",data);
//     renderWeatherInfo(data);
// }

const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-loacation-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

let currentTab = userTab;
currentTab.classList.add("current-tab");
getFromSessionStorage();
function switchTab(tab) {
    if (tab !== currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = tab;
        tab.classList.add("current-tab");

        if (tab === searchTab) {
            // Clear any existing weather data and show only the search form
            searchForm.classList.add("active");
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            loadingScreen.classList.remove("active");
            
            // Clear the search input field
            searchInput.value = "";
        } else {
            // Switch back to user weather tab
            searchForm.classList.remove("active");
            getFromSessionStorage(); // Load user weather or show grant access
        }
    }
}


function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        grantAccessContainer.classList.add("active"); 
    } else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}
async function fetchWeatherData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            // Handle non-200 responses
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        displayErrorMessage("Failed to fetch weather data. Please try again later.");
        throw error; // Rethrow for higher-level handling if needed
    }
}
async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    try {
        const data = await fetchWeatherData(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (err) {
        loadingScreen.classList.remove("active");
    }
}


function renderWeatherInfo(data) {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-clouds]");

    cityName.innerText = data?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    desc.innerText = data?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.innerText = `${data?.main?.temp} °C`;
    windspeed.innerText = `${data?.wind?.speed} m/s`;
    humidity.innerText = `${data?.main?.humidity} %`;
    cloudiness.innerText = `${data?.clouds?.all} %`;
     userInfoContainer.scrollTop = 0;
    
    // Add a small timeout to allow DOM to update before checking
    setTimeout(() => {
        if (userInfoContainer.scrollHeight > userInfoContainer.clientHeight) {
            // If content overflows, adjust the container height
            userInfoContainer.style.maxHeight = 'none';
            userInfoContainer.parentElement.style.maxHeight = '90vh';
        }
    }, 100);
    

}
userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, () => {
            alert("Location access denied. Please enable location services.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");
    fetchUserWeatherInfo(userCoordinates);
}
const grantAccessButton  = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener('click',getLocation);    

const searchInput = document.querySelector("[data-searchInput]"); 
searchForm.addEventListener("submit" ,(e) => {
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName.trim() == "") {
        return;
    }else{
        fetchSearchWeatherInfo(cityName.trim());
    }
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const data = await fetchWeatherData(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (err) {
        loadingScreen.classList.remove("active");
        // Clear any previous weather data if search fails
        userInfoContainer.classList.remove("active");
    }
}

function displayErrorMessage(message) {
    const errorContainer = document.querySelector(".error-container");
    if (!errorContainer) {
        const newErrorContainer = document.createElement("div");
        newErrorContainer.className = "error-container";
        newErrorContainer.style.color = "red";
        newErrorContainer.style.margin = "10px";
        newErrorContainer.style.textAlign = "center";
        newErrorContainer.textContent = message;

        const userInfoContainer = document.querySelector(".user-info-container");
        userInfoContainer.appendChild(newErrorContainer);
    } else {
        errorContainer.textContent = message; // Update existing error message
    }
}
