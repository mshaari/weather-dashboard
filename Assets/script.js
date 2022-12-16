var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || []; //declare this outside of a function so that it's a universal variable

//declare lat/lon variables for local use
var lat;
var lon;


$('#searchCityButton').on('click', function () {    
    $(".weatherSegment").empty(); //clears past weather segment
    $("#nameOfCityEntered").empty(); //clears the title of the city from the previous search

    var cityName = $('#cityName').val();

    var geocodingURL = 'http://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=5&appid=dcf204ce377ddb8eb2328c6723f67b46';
    
    $.ajax({
    url: geocodingURL,
    method: 'GET',
    }).then(function (response) {
        console.log(response);
        lat = response[0].lat;
        lon = response[0].lon;
    }).then(function () {
        var openWeatherURL = 'https://api.openweathermap.org/data/2.5/forecast?lat='+ lat + '&lon=' + lon + '&units=imperial&appid=dcf204ce377ddb8eb2328c6723f67b46'; //NEED TO SOMEHOW ADD LAT AND LON IN HERE

        $.ajax({
        url: openWeatherURL,
        method: 'GET',
        }).then(function (response) {
            console.log(response);
            var cityFromCoordinates = response.city.name;
            $(`<h1>Weather for ${cityFromCoordinates}</h2>`).appendTo('#nameOfCityEntered'); //sometimes shows no result

            searchHistory.push(cityFromCoordinates);
            localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

            for (var i=0; i<5; i++) {
                var dayID= document.getElementById("day" + [i]);
                var dateHeader = document.createElement("h2");
                dateHeader.textContent = i + ' day(s) in the future';
                dayID.appendChild(dateHeader);

                //display weather icon
                weatherIcon= response.list[i].weather[0].icon;
                weatherIconURL='http://openweathermap.org/img/wn/' + weatherIcon + '@2x.png';
                $(`<img src='${weatherIconURL}'>`).appendTo(dayID);

                //display temp
                temp= response.list[i].main.temp;
                $(`<p>Temperature is ${temp} \u00B0F</p>`).appendTo(dayID);

                //display wind
                wind= response.list[i].wind.speed;
                $(`<p>Wind is ${wind} mph</p>`).appendTo(dayID);

                //display humidity
                humidity= response.list[i].main.humidity;
                $(`<p>Humidity is ${humidity}%</p>`).appendTo(dayID);
            };
    });
    });
});

for (i = (searchHistory.length - 5); i < searchHistory.length ; i++) { 
    var searchHistoryElement = document.createElement("li");
    searchHistoryElement.textContent = searchHistory[i];
    var searchHistoryBlock = document.getElementById('searchHistory');
    searchHistoryBlock.appendChild(searchHistoryElement);
}