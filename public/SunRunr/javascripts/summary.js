function sendReqForSummaryInfo() {
  $.ajax({
    url: '/devices/summary',
    type: 'POST',
    headers: { 'x-auth': window.localStorage.getItem("authToken")},
    data : {deviceID : $('#deviceId').val()},
    dataType: 'json'
  })
    .done(summaryInfoSuccess)
    .fail(summaryInfoError);
}

function summaryInfoSuccess(data, textSatus, jqXHR) { 
      console.log(window.localStorage);
      $("#WactivityDate").html(data.Wdate);
      $("#Wduration").html(data.WDuration);
      $("#WuvExposure").html(data.Wuv);
      $("#WcaloriesBurned").html(data.Wcalories);
      $("#Wtemperature").html("62 F");
      $("#WHumidity").html("53%");
      $("#deviceId").html(data.deviceId);
      $("#totalActivityDuration").html(data.totalDuration);
      $("#totalCaloriesBurned").html(data.totalCalories);
      $("#totalUVExposure").html(data.totalUV);
      $("#CactivityDate").html(data.Cdate);
      $("#Cduration").html(data.CDuration);
      $("#CuvExposure").html(data.Cuv);
      $("#CcaloriesBurned").html(data.Ccalories);
      $("#Ctemperature").html("62 F");
      $("#CHumidity").html("53%");

      $("#RactivityDate").html(data.Rdate);
      $("#Rduration").html(data.RDuration);
      $("#RuvExposure").html(data.Ruv);
      $("#RcaloriesBurned").html(data.Rcalories);
      $("#Rtemperature").html("62 F");
      $("#RHumidity").html("53%");

}


function summaryInfoError(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken 
  // redirect user to sign-in page (which is index.html)
  if( jqXHR.status === 401 ) {
    window.localStorage.removeItem("authToken");
    window.location.replace("index.html");
  } 
  else {
    $("#error").html("Error: " + status.message);
    $("#error").show();
  } 
}

// Handle authentication on page load
$(function() {
  // If there's no authToekn stored, redirect user to 
  // the sign-in page (which is index.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
  }
  else {
    sendReqForSummaryInfo();
      
});
