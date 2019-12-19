function sendReqForWeatherInfo() {
  $.ajax({
    url: 'http://api.openweathermap.org/data/2.5/forecast?zip=85721,us&APPID=60ab1964888a64b3be918945580228dc',
    type: 'GET',
    dataType: 'json',
    contentType: 'application/json'
  })
    .done(displayMostRecentWeather)
    .fail(recentWeatherError);
}

function displayMostRecentWeather(data, textSatus, jqXHR) {
  console.log(data);
   $("#tempDay1").html(data.temp[0]);
    $("#humidDay1").html(data.humid[0]);
    $("#tempDay2").html(data.temp[1]);
    $("#humidDay2").html(data.humid[1]);
     $("#tempDay3").html(data.temp[2]);
    $("#humidDay3").html(data.humid[2]);
     $("#tempDay4").html(data.temp[3]);
    $("#humidDay4").html(data.humid[3]);
    $("#tempDay5").html(data.temp[4]);
    $("#humidDay5").html(data.humid[4]);

}

function recentWeatherError(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken 
  // redirect user to sign-in page (which is index.html)
  if( jqXHR.status === 401 ) {
    window.localStorage.removeItem("authToken");
    window.location.replace("index.html");
  } 
  else {
    $("#ServerResponse").html("Error: " + status.message);
    $("#ServerResponse").show();
  } 
}

// Executes once the google map api is loaded, and then sets up the handler's and calls
// getRecentPotholes() to display the recent potholes
function initRecent() {
    // Allow the user to refresh by clicking a button.
    $("#refreshRecent").click(sendReqForWeatherInfo);
    sendReqForWeatherInfo();
}

// Handle authentication on page load
$(function() {
   // If there's no authToken stored, redirect user to the signin page (i.e., index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("index.html");
   }
   else{
     //sendReqForWeatherInfo();
   }
});
