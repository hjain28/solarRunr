function sendReqForSummaryInfo() {
  $.ajax({
    url: '/devices/summary',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(summaryInfoSuccess)
    .fail(summaryInfoError);
}

function summaryInfoSuccess(data, textSatus, jqXHR) {
  
  // Add the devices to the list before the list item for the add device button (link)
  for (var position of data.positions) {
    ("#deviceId").html(position.deviceId);
    ("#longitude").html(position.longitude);
    ("#latitude").html(position.latitude);
    ("#uv").html(position.uv);
    ("#speed").html(position.gpsSpeed);
  }
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

// Registers the specified device with the server.




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
