//appid=00ac63cafa4c25e7c142d8cdb9b63fc2";

let citySearchEl = document.querySelector("#city-search");
let citySearchBtnEl = document.querySelector("#cs-btn");

// get the input from the text field and send it to get the weather info
let formSubmitHandler = function(event) {
    event.preventDefault();
    let citySearchName = citySearchEl.value.trim();

    if (citySearchName) {
        getWeatherInfo(citySearchName);
        citySearchEl.value = "";
    } else {
        alert("Please enter a city name");
    }
}

let getWeatherInfo = function(cityName) {
    //this first part gets the latitude and longitude of the named city to put into the oncall api
    let apiUrlLatLon = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=1&appid=00ac63cafa4c25e7c142d8cdb9b63fc2"; 
    // Checks to see if we received a valid response
    fetch(apiUrlLatLon).then(function(response){
        if (response.ok) {
            response.json().then(function(data){
                //uses the latitude and longitude from the data received to place another API call to get the latitude and longitude
                let apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + data[0].lat + "&lon=" + data[0].lon + "&exclude=minutely,hourly&appid=00ac63cafa4c25e7c142d8cdb9b63fc2"
                fetch(apiUrl).then(function(response){
                    if (response.ok) {
                        response.json().then(function(data){
                            //console.log(data);
                        });
                    } else {
                        alert("No weather data for this city");
                        return false;
                    }
                });
            });
        } else {
            alert("Cannot find City");
            return false;
        }
    });
};

citySearchBtnEl.addEventListener("click", formSubmitHandler);
