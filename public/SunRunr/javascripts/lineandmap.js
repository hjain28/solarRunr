var window.line_data= [];
var window.map_data = [];

function sendReqForSummaryInfo() {
  $.ajax({
    url: '/devices/lineandmap',
    type: 'POST',
    headers: { 'x-auth': window.localStorage.getItem("authToken")},
    data : {deviceID : $('#deviceId').val()},
    dataType: 'json'
  })
    .done(summaryInfoSuccess)
    .fail(summaryInfoError);
}

function summaryInfoSuccess(data, textSatus, jqXHR) { 
     line_data = data.lineData;
    map_data = data.mapData;
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

  }
  
});
