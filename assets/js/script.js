//appid=00ac63cafa4c25e7c142d8cdb9b63fc2";

let citySearchEl = document.querySelector("#city-search");
let citySearchBtnEl = document.querySelector("#cs-btn");
let cityPrevSearchEl = document.querySelector("#previous-cs-box");
let cityCurrWeatherEl = document.querySelector("#wb-top");
let cityFutWeatherEl = document.querySelector("#forcast-boxes");
let currDate = new Date();
const prevSearches = [];

// get the input from the text field and send it to get the weather info

let formSubmitHandler = function(event) {
    event.preventDefault();
    let citySearchName = citySearchEl.value.trim();
    let searchHistoryEl = document.createElement("button");
    searchHistoryEl.textContent = citySearchName;
    searchHistoryEl.className = "p-search-btn";
    if (citySearchName) {
        getWeatherInfo(citySearchName);
        saveSearchCity(citySearchName);
        citySearchEl.value = "";
    } else {
        alert("Please enter a city name");
        return false;
    }
};

let saveSearchCity = function(citySearchedName) {
    prevSearches.push(citySearchedName);
    let pSearchBtnEl = document.createElement("button");
    pSearchBtnEl.className = "p-search-btn";
    pSearchBtnEl.setAttribute("data-city", citySearchedName);
    pSearchBtnEl.textContent = citySearchedName;
    pSearchBtnEl.addEventListener("click", function() {
    getWeatherInfo(citySearchedName);
    });
    cityPrevSearchEl.appendChild(pSearchBtnEl);
    localStorage.setItem("cities", JSON.stringify(prevSearches));
    
};

let loadSearchCity = function() {
    let citiesSearched = JSON.parse(localStorage.getItem("cities"));
    if (citiesSearched) {
        for (let i = 0 ; i < citiesSearched.length ; i++){
            saveSearchCity(citiesSearched[i]);
        }

    }
};

let getWeatherInfo = function(cityName) {

    //this first part gets the latitude and longitude of the named city to put into the oncall api

    let apiUrlLatLon = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=1&appid=00ac63cafa4c25e7c142d8cdb9b63fc2"; 
    // Checks to see if we received a valid response
    fetch(apiUrlLatLon).then(function(response){
        if (response.ok) {
            response.json().then(function(data){

                //send data to function to get true city name and weather information

               getLocationData(data);
            });
        } else {
            alert("Cannot find City");
            return false;
        }
    });
};

let getLocationData = function(cInfo) {
     //uses the latitude and longitude from the data received to place another API call to get the latitude and longitude
     let apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + cInfo[0].lat + "&lon=" + cInfo[0].lon + "&exclude=minutely,hourly&appid=00ac63cafa4c25e7c142d8cdb9b63fc2"
     //reverse the search to get the true name of the city from the coordinates
     let trueCityNameUrl = "http://api.openweathermap.org/geo/1.0/reverse?lat=" + cInfo[0].lat + "&lon=" + cInfo[0].lon + "&limit=1&appid=00ac63cafa4c25e7c142d8cdb9b63fc2";
     //get weather data
     Promise.all([
         fetch(apiUrl),
         fetch(trueCityNameUrl)
     ]).then(allResponses => {
         const weatherInfo = allResponses[0].json()
         const trueCity = allResponses[1].json()
         displayWeatherInfo(weatherInfo, trueCity);
     });
};

let displayWeatherInfo = function(wInfo, tCityName){
    // clear current weather elements

    cityCurrWeatherEl.innerHTML = "";
    cityFutWeatherEl.innerHTML = "";

    // get true city name from geolocation

    tCityName.then(function(data) {
        let currCityName = document.createElement("h2");
        currCityName.textContent = data[0].name + ", " + data[0].state + " (" + data[0].country + ") | " + currDate.toDateString();
        let currWeatherIconEl = document.createElement("img");
        currWeatherIconEl.className = "weather-icon";
        currCityName.appendChild(currWeatherIconEl);
        cityCurrWeatherEl.appendChild(currCityName);
    });
    wInfo.then(function(data) {
        //Create elements that will contain and show the information gathered from the data

        let currWeatherIconEl = document.querySelector(".weather-icon");
        currWeatherIconEl.setAttribute("src", "https://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png");
        currWeatherIconEl.setAttribute("alt", data.current.weather[0].description);

        let currTempEl = document.createElement("p");
        currTempEl.textContent = "Current Temperature: " + Math.floor((data.current.temp - 273.15) * (9 / 5) + 32) + " (F)/" + Math.floor((data.current.temp - 273.15)) + " (C) (or " + data.current.temp + " (K))";
        cityCurrWeatherEl.appendChild(currTempEl)

        let currWindEl = document.createElement("p");
        currWindEl.textContent = "Wind Speed: " + (data.current.wind_speed * 2.237).toFixed(2) + " MPH";
        cityCurrWeatherEl.appendChild(currWindEl)

        let currHumidityEl = document.createElement("p");
        currHumidityEl.textContent = "Humidity: " + data.current.humidity + "%";
        cityCurrWeatherEl.appendChild(currHumidityEl)

        let currUVIndexEl = document.createElement("p");
        let currUVDangerEl = document.createElement("span");
        currUVDangerEl.textContent = data.current.uvi;
        currUVDangerEl.id = "uv-danger";

        //set up color identifiers for UV index danger levels

        if (data.current.uvi < 3) {
            currUVDangerEl.className = "uv-danger uv-low";
        } else if (data.current.uvi >= 3 && data.current.uvi < 6 ) {
            currUVDangerEl.className = "uv-danger uv-moderate";
        } else if (data.current.uvi >= 6 && data.current.uvi < 8) {
            currUVDangerEl.className = "uv-danger uv-high";
        } else if (data.current.uvi >= 8 && data.current.uvi < 11) {
            currUVDangerEl.className = "uv-danger uv-very-high";
        } else if (data.current.uvi >= 11) {
            currUVDangerEl.className = "uv-danger uv-severe";
        } else {
            currUVDangerEl.className = "uv-danger uv-noneFound";
        }
        currUVIndexEl.textContent = "UV Index: ";
        currUVIndexEl.appendChild(currUVDangerEl);

        //append to container to show on webpage

        cityCurrWeatherEl.appendChild(currUVIndexEl)

        // create forecast boxes

        for (let i = 0 ; i < 5 ; i++){
            let forcastData = data.daily[i];
            let fBoxContEl = document.createElement("div");
            fBoxContEl.className = "f-box";

            let fBoxDateEl = document.createElement("h4");
            fBoxDateEl.textContent = forecastDay(currDate, (i + 1));
            fBoxContEl.appendChild(fBoxDateEl);

            let fBoxSymEl = document.createElement("img");
            fBoxSymEl.setAttribute("src", "https://openweathermap.org/img/wn/" + forcastData.weather[0].icon + ".png");
            fBoxSymEl.setAttribute("alt", forcastData.weather[0].description);
            fBoxContEl.appendChild(fBoxSymEl);

            let fBoxTempEl = document.createElement("p");
            fBoxTempEl.textContent = "Temp: " + Math.floor((forcastData.temp.day - 273.15) * (9 / 5) + 32) + " (F)/" + Math.floor((forcastData.temp.day - 273.15)) + " (C)";
            fBoxContEl.appendChild(fBoxTempEl);

            let fBoxWindEl = document.createElement("p");
            fBoxWindEl.textContent = "Wind: " + (forcastData.wind_speed * 2.237).toFixed(2) + " MPH";
            fBoxContEl.appendChild(fBoxWindEl);

            let fBoxHumEl = document.createElement("p");
            fBoxHumEl.textContent = "Humidity: " + forcastData.humidity + "%";
            fBoxContEl.appendChild(fBoxHumEl);

            cityFutWeatherEl.appendChild(fBoxContEl);
        }

        
    });

};

// add days for the forecast date element

function forecastDay(date, addD) {
    var result = new Date(date);
    result.setDate(result.getDate() + addD);
    return result.toDateString();
  }

citySearchBtnEl.addEventListener("click", formSubmitHandler);

loadSearchCity();
