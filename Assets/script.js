var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || []; //declare this outside of a function so that it's a universal variable

//declare lat/lon variables for local use
var lat;
var lon;

//create search history element (HOW DO YOU GET THIS TO UPDATE IN REALTIME THOUGH)
for (i = (searchHistory.length - 5); i < searchHistory.length; i++) {    
    var searchHistoryBlock = document.getElementById('searchHistory');
    var searchHistoryElement = document.createElement("p");
    searchHistoryElement.setAttribute("class", "searchHistoryElement")
    searchHistoryElement.textContent = searchHistory[i];
    searchHistoryBlock.appendChild(searchHistoryElement);
}

//This is how you can click on an element in search history and it will show the weather for that city
$(".searchHistoryElement").on("click", function () {
    $("#cityName").val($(this).text());
    console.log("this works");
    $("#searchCityButton").click();
})


//This is the bulk of this code for actually showing the weather
$('#searchCityButton').on('click', function () {
    $(".weatherSegment").empty(); //clears past weather segment
    $("#nameOfCityEntered").empty(); //clears the title of the city from the previous search

    var cityName = $('#cityName').val();
    $("#information").css("background-color", "azure");



    //NEED TO CONSIDER WHAT HAPPENS WHEN THERE IS A CITY WITH NO RESULTS

    var geocodingURL = 'http://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=5&appid=dcf204ce377ddb8eb2328c6723f67b46';

    $.ajax({
        url: geocodingURL,
        method: 'GET',
    }).then(function (response) {
        console.log(response);
        lat = response[0].lat;
        lon = response[0].lon;
    }).then(function () {
        var openWeatherURL = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&units=imperial&appid=dcf204ce377ddb8eb2328c6723f67b46'; //NEED TO SOMEHOW ADD LAT AND LON IN HERE

        var openWeatherCurrentURL = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&units=imperial&appid=dcf204ce377ddb8eb2328c6723f67b46';
        
        $.ajax({
            url: openWeatherURL,
            method: 'GET',
        }).then(function (response) {
            console.log(response);
            var cityFromCoordinates = response.city.name;
            $(`<h1>Weather for ${cityFromCoordinates}</h2>`).appendTo('#nameOfCityEntered'); //sometimes shows no result

            searchHistory.push(cityFromCoordinates);
            localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

            for (var i = 0; i < 5; i++) {
                //use this function to set variable dayID = to the ID of the segment for that particular day
                var dayID = document.getElementById("day" + [i]);

                var y = (3 + 8*i); //this is how we access the yth object element that corresponds for noon for each day

                var dateHeader = document.createElement("h2");
                dateHeader.textContent = response.list[y].dt_txt;
                dayID.appendChild(dateHeader);

                $("#FiveDayForecast").text("5 Day Forecast");

                //display weather icon
                weatherIcon = response.list[y].weather[0].icon;
                weatherIconURL = 'http://openweathermap.org/img/wn/' + weatherIcon + '@2x.png';
                $(`<img src='${weatherIconURL}'>`).appendTo(dayID);

                //display temp
                temp = response.list[y].main.temp;
                $(`<p>Temperature is ${temp} \u00B0F</p>`).appendTo(dayID);

                //display wind
                wind = response.list[y].wind.speed;
                $(`<p>Wind is ${wind} mph</p>`).appendTo(dayID);

                //display humidity
                humidity = response.list[y].main.humidity;
                $(`<p>Humidity is ${humidity}%</p>`).appendTo(dayID);

                $(".weatherSegment").css("border", "5px solid black");
                $(".weatherSegment").css("padding", "10px");
            };
        });

        $.ajax({
            url: openWeatherCurrentURL,
            method: 'GET',
        }).then(function (response) {
            console.log(response);
            
            var currentDayId = document.getElementById("currentWeather");

            var dateHeader = document.createElement("h2");
            dateHeader.textContent = "Current Weather";
            currentDayId.appendChild(dateHeader);

            //display weather icon
            weatherIcon = response.weather[0].icon;
            weatherIconURL = 'http://openweathermap.org/img/wn/' + weatherIcon + '@2x.png';
            $(`<img src='${weatherIconURL}'>`).appendTo(currentDayId);

            //display temp
            temp = response.main.temp;
            $(`<p>Temperature is ${temp} \u00B0F</p>`).appendTo(currentDayId);

            //display wind
            wind = response.wind.speed;
            $(`<p>Wind is ${wind} mph</p>`).appendTo(currentDayId);

            //display humidity
            humidity = response.main.humidity;
            $(`<p>Humidity is ${humidity}%</p>`).appendTo(currentDayId);
        });
    });
});