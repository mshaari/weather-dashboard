//Declare an array searchHistory that is either a pre-exising array from local storage (using JSON.parse) or an empty array if the local storage for "searchHistory" is empty
var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

//Declare a lat and lon variable to store the latitude and longitude that matches the city the user inputs (universal variable)
var lat;
var lon;

//A function to create the search history that executes 5 times starting at the last index (most recent search)
function createSearchHistory() {
    $("#searchHistory").empty();
    for (i = (searchHistory.length - 1); i > (searchHistory.length - 6); i--) {
        $(`<p class="searchHistoryElement"> ${searchHistory[i]} </p>`).appendTo("#searchHistory");
    }

    //This is how you can click on an element in search history and it will show the weather for that city. It takes the value of the element they clicked, inserts it into the search box, and clicks search with that value
    $(".searchHistoryElement").on("click", function () {
        $("#cityName").val($(this).text());
        $("#searchCityButton").click();
    })
}

createSearchHistory();

//If they click on the main banner that says Weather Dashboard, it will reload the page
$("#mainBanner").on("click", function () {
    location.reload();
})

//This is the bulk of this code for actually showing the weather
$('#searchCityButton').on('click', function () {
    //Clears past weather segment if anything was there
    $(".weatherSegment").empty();

    //Clears the title of the city from the previous search
    $("#nameOfCityEntered").empty();

    //Set variable cityName equal to the value of element with id="cityName" (what the user typed in as the city name)
    var cityName = $('#cityName').val();

    //Sets the div with id="information" to have background-color of azure 
    $("#information").css("background-color", "azure");

    //If they user hits search without any city entered, they're alerted that they have an invalid input and the page is reloaded
    if (cityName === "") {
        window.alert("Invalid input . Please enter a valid city name after clicking OK.");
        location.reload();
    }

    //Sets geocodingURL equal to the API URL specific to the city the user entered
    var geocodingURL = 'https://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=5&appid=dcf204ce377ddb8eb2328c6723f67b46';

    $.ajax({ //This segment is for getting lat/lon of entered city
        url: geocodingURL,
        method: 'GET',
    }).then(function (response) {
        console.log(response);

        //If the user entered a city with no matches, it alerts that they entered an invalid city and reloads the page. Otherwise, it stores the latitude and longitude of that city in the lat/lon variables
        if (response.length === 0) {
            window.alert("Invalid input . Please enter a valid city name after clicking OK.");
            location.reload();
        } else {
            lat = response[0].lat;
            lon = response[0].lon;
        }
    }).then(function () { //This segment handles using that lat/long to get the weather 
        //Sets openWeatherURL equal to the API URL specific to the lat/lon for the city the user entered (used to get 5 day forecast)
        var openWeatherURL = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&units=imperial&appid=dcf204ce377ddb8eb2328c6723f67b46';

        //Sets openWeatherCurrentURL equal to the API URL specific to the lat/lon for the city the user entered (used to get current weather)
        var openWeatherCurrentURL = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&units=imperial&appid=dcf204ce377ddb8eb2328c6723f67b46';

        $.ajax({ //This segment is for getting the 5 day forecast
            url: openWeatherURL,
            method: 'GET',
        }).then(function (response) {
            console.log(response);

            //Set cityFromCoordinates equal to the city name that matches the lat/lon from the user's input (the closest match)
            var cityFromCoordinates = response.city.name;

            //Creates h1 banner that says "Weather for <cityFromCoordinates>" and appends it to the element with id="nameOfCityEntered"
            $(`<h1>Weather for ${cityFromCoordinates}</h1>`).appendTo('#nameOfCityEntered');

            //Pushes that city to the searchHistory array
            searchHistory.push(cityFromCoordinates);

            //Sends that updated array to local storage for "searchHistory" using JSON.stringify
            localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

            //Update search history with new city
            createSearchHistory();

            //For loop that iterates 5 times to display the weather forecast for the next 5 days
            for (var i = 0; i < 5; i++) {
                //This sets a variable dayID = to the ID of the segment for that particular day (since the ID for each div for each day's weather is "day0", "day1", ... we can just set it to "day" + [i] if i starts at 0 and ends at 4)
                var dayID = document.getElementById("day" + [i]);

                //Sets some other variable y = (3 + 8*i) since each day has 8 different times where the weather is recorded so by adding 8 a certain number of times (either 0, 1, 2, 3, or 4 times depending on what i is) you end up at the same time interval just on different days. This y is used to access the yth element of the list of weather reports
                var y = (3 + 8 * i);

                //Sets h2 element with text equal to response.list[y].dt_txt which is the date of the yth element's weather and appends it to the weather div with dayID (this is what displays the date and time in each weather block) 
                var date= new Date(response.list[y].dt * 1000).toLocaleDateString();

                $(`<h3>${date}</h3>`).appendTo(dayID);

                //This sets the element with id="FiveDayForecast" to have text that says "5 Day Forecast"
                $("#FiveDayForecast").text("5 Day Forecast");

                //Gets the weather icon id, sets the weatherIconURL to use that id to get the URL to that icon, and then creates img element with that URL (which is the weather icon)
                weatherIcon = response.list[y].weather[0].icon;
                weatherIconURL = 'https://openweathermap.org/img/wn/' + weatherIcon + '@2x.png';
                $(`<img src='${weatherIconURL}'>`).appendTo(dayID);

                //Display temperature
                temp = response.list[y].main.temp;
                $(`<p>Temperature is ${temp} \u00B0F</p>`).appendTo(dayID);

                //Display wind
                wind = response.list[y].wind.speed;
                $(`<p>Wind is ${wind} mph</p>`).appendTo(dayID);

                //Display humidity
                humidity = response.list[y].main.humidity;
                $(`<p>Humidity is ${humidity}%</p>`).appendTo(dayID);

                //Add border and padding around elements with class="weatherSegment"
                $(".weatherSegment").css("border", "3px solid black");
                $(".weatherSegment").css("padding", "5px");
            };
        });


        $.ajax({ //This segment is for getting the current weather conditions
            url: openWeatherCurrentURL,
            method: 'GET',
        }).then(function (response) { //This displays current conditions
            console.log(response);

            //Creates h2 element that says "Current Weather" and appends it to #currentWeather element
            $('<h2>Current Weather</h2>').appendTo("#currentWeather");

            //Gets the weather icon id, sets the weatherIconURL to use that id to get the URL to that icon, and then creates img element with that URL (which is the weather icon)
            weatherIcon = response.weather[0].icon;
            weatherIconURL = 'https://openweathermap.org/img/wn/' + weatherIcon + '@2x.png';
            $(`<img src='${weatherIconURL}'>`).appendTo("#currentWeather");

            //Display temp
            temp = response.main.temp;
            $(`<p>Temperature is ${temp} \u00B0F</p>`).appendTo("#currentWeather");

            //Display wind
            wind = response.wind.speed;
            $(`<p>Wind is ${wind} mph</p>`).appendTo("#currentWeather");

            //Display humidity
            humidity = response.main.humidity;
            $(`<p>Humidity is ${humidity}%</p>`).appendTo("#currentWeather");
        });
    });
});