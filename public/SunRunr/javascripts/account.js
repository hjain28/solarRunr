function sendReqForAccountInfo() {
  $.ajax({
    url: '/users/account',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(accountInfoSuccess)
    .fail(accountInfoError);
}

function accountInfoSuccess(data, textSatus, jqXHR) {
  $("#email").html(data.email);
  $("#fullName").html(data.fullName);
  $("#lastAccess").html(data.lastAccess);
  $("#password").html(" *******");
    
  $("#main").show();
  
  // Add the devices to the list before the list item for the add device button (link)
  for (var device of data.devices) {
    $("#addDeviceForm").before("<li class='collection-item'>ID: " +
      device.deviceId + ", APIKEY: " + device.apikey/* + 
      " <button id='ping-" + device.deviceId + "' class='waves-effect waves-light btn'>Ping</button> " */
      +

      /*" <button id='delete-" + device.deviceId + "' class='waves-effect waves-light btn'>Delete</button> "*/
        /*\\ +
  " <button id='summary-" + device.deviceId + "' class='waves-effect waves-light btn'>Summary</button> "
        */ +
      " </li>"
  );


  }
   

    /*$("#ping-"+device.deviceId).click(function(event) {
      pingDevice(event, device.deviceId);
    });*/

    /*$("#delete-"+device.deviceId).click(function(event) {
      console.log($("#delete-"+device.deviceId));      
      deleteDevice(event, $("#delete-"+device.ID).val());
    });/*

    $("#summary-"+device.deviceId).click(function(event) {
      summaryList(event, device.deviceId);
    });*/
  }


function accountInfoError(jqXHR, textStatus, errorThrown) {
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
function registerDevice() {
 if($("#deviceId").val().length>0){
  $.ajax({
    url: '/devices/register',
    type: 'POST',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },  
    contentType: 'application/json',
    data: JSON.stringify({ deviceId: $("#deviceId").val() }), 
    dataType: 'json'
   })
     .done(function (data, textStatus, jqXHR) {
       // Add new device to the device list
       $("#addDeviceForm").before("<li class='collection-item'>ID: " +
       $("#deviceId").val() + ", APIKEY: " + data["apikey"] + 
         /*" <button id='ping-" + $("#deviceId").val() + "' class='waves-effect waves-light btn'>Ping</button> " +
         " <button id='delete-" + $("#deviceId").val() + "' class='waves-effect waves-light btn'>Delete</button> "
         +*/
         "</li>");
    //    $("#ping-"+$("#deviceId").val()).click(function(event) {
    //      pingDevice(event, device.deviceId);
    //    });
    // $("#delete-"+$("#deviceId").val()).click(function(event) {
    //      deleteDevice(event, device.deviceId);
    //    });
       hideAddDeviceForm();
     })
     .fail(function(jqXHR, textStatus, errorThrown) {
       let response = JSON.parse(jqXHR.responseText);
       $("#error").html("Error: " + response.message);
       $("#error").show();
     }); 
 }
 else{
       $("#error").html("Error: Invalid Device ID.");
       $("#error").show();
 }
}

function deleteDevice(event, data) {

console.log(data);


 if(data.length>0){

  $.ajax({
    url: '/devices/delete',
    type: 'POST',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },  
    contentType: 'application/json',
    data: JSON.stringify({ deviceId: data}), 
    dataType: 'json'
   })
     .done(function (data, textStatus, jqXHR) {
       window.location = "account.html";
     })
     .fail(function(jqXHR, textStatus, errorThrown) {
       let response = JSON.parse(jqXHR.responseText);
       $("#error").html("Error: " + response.message);
       $("#error").show();
     }); 
 }
 else{
       //$("#error").html($("#delete-"+device.deviceId).val());
       $("#error").html("Error: Invalid Device ID.");
       $("#error").show();
 }
}

function summaryDevice(event, data){
  $.ajax({
        url: '/devices/summary',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },
        data: { 'deviceId': data },
        dataType: 'json'
       }).done(function (data, textStatus, jqXHR) {
        console.log(data);
  //       ("#deviceIdRow").html(data.deviceId);
  //     ("#longitude").html(data.longitude);
  //     ("#latitude").html(data.latitude);
  //     ("#uv").html(data.uv);
  //     ("#speed").html(data.gpsSpeed);
  // ("#summaryListControl").show();
        window.location = "summary.html";
  
     })
     .fail(function(jqXHR, textStatus, errorThrown) {
       let response = JSON.parse(jqXHR.responseText);
       $("#error").html("Error: " + response.message);
       $("#error").show();
     }); 
}

/*function pingDevice(event, deviceId) {
   $.ajax({
        url: '/devices/ping',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { 'deviceId': deviceId }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
            console.log("Pinged.");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}

function deleteDevice(event, deviceId) {
  console.log("your mom");
   $.ajax({
        url: '/devices/delete',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { 'deviceId': deviceId }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
            console.log("Deleted.");
            window.location = "account.html";
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}

function summaryList(event, deviceId) {
console.log("here");
   $.ajax({
        url: '/Himanshu/summaryList',
        type: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { 'deviceId': deviceId }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
            console.log("Listed.");
  window.location = "summaryList.html";
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}
*/

function showAddDeviceForm() {
  $("#deviceId").val("");        // Clear the input for the device ID
  $("#addDeviceControl").hide();   // Hide the add device link
  $("#addDeviceForm").slideDown();  // Show the add device form
}

function showDeleteDeviceForm() {
  $("#deviceId").val("");        // Clear the input for the device ID
  $("#deleteDeviceControl").hide();   // Hide the add device link
  $("#deleteDeviceForm").slideDown();  // Show the add device form
}


function showSummaryDeviceForm() {
  $("#deviceId").val("");        // Clear the input for the device ID
  $("#summaryDeviceControl").hide();   // Hide the add device link
  $("#summaryDeviceForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideAddDeviceForm() {
  $("#addDeviceControl").show();  // Hide the add device link
  $("#addDeviceForm").slideUp();  // Show the add device form
  $("#error").hide();
}

function hideDeleteDeviceForm() {
  $("#deleteDeviceControl").show();  // Hide the add device link
  $("#deleteDeviceForm").slideUp();  // Show the add device form
  $("#error").hide();
}

function hideSummaryDeviceForm() {
  $("#summaryDeviceControl").show();  // Hide the add device link
  $("#summaryDeviceForm").slideUp();  // Show the add device form
  $("#error").hide();
}

function updateAccount(){
  let email = $('#emailNew').val();
  let fullName = $('#fullNameNew').val();

  let emailRe = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
  let isValid = true;
  $('#ServerResponse').html("");

   if(!emailRe.test(email)){
  $('#ServerResponse').append("<span class='red-text text-darken-2'><li>Invalid or missing email address.</li></span>");
  isValid = false;
  }

  if(fullName.length == 0 ){
  $('#ServerResponse').append("<span class='red-text text-darken-2'><li>Missing full name.</li></span>");
  isValid = false;
  }

  if(isValid == false){
  $('#ServerResponse').show();
  return;
  }
  else{
  $.ajax({
        url: '/users/update',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        contentType: 'application/json',
  data: JSON.stringify({ email: $("#emailNew").val(), fullName: $("#fullNameNew").val() }), 
  dataType: 'json'
       }).done(function (data, textStatus, jqXHR) {
      $("#email").html($("#emailNew").val());
      $("#fullName").html($("#fullNameNew").val());
  console.log(window.localStorage.getItem("authToken"));
       hideUpdateForm();
  window.localStorage.removeItem("authToken");
  window.location = "index.html";
     })
     .fail(function(jqXHR, textStatus, errorThrown) {
       let response = JSON.parse(jqXHR.responseText);
       $("#ServerResponse").html("Error: " + response.message);
       $("#ServerResponse").show();
     }); }
}

function replaceDevice(){
  let deviceIdOld = $('#deviceIdOld').val();
  let deviceIdNew = $('#deviceIdNew').val();

  let isValid = true;
  $('#error').html("");

  if(deviceIdOld.length == 0 ){
  $('#error').append("<span class='red-text text-darken-2'><li>Missing Old Device Id.</li></span>");
  isValid = false;
  }

  if(deviceIdNew.length == 0 ){
  $('#error').append("<span class='red-text text-darken-2'><li>Missing New Device Id.</li></span>");
  isValid = false;
  }

  if(isValid == false){
  $('#error').show();
  return;
  }
  else{
  $.ajax({
        url: '/devices/replace',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        contentType: 'application/json',
  data: JSON.stringify({ deviceId: $("#deviceIdOld").val(), deviceIdNew: $("#deviceIdNew").val() }), 
  dataType: 'json'
       }).done(function (data, textStatus, jqXHR) {
         hideReplaceDeviceForm();
        window.location = "account.html";
     })
     .fail(function(jqXHR, textStatus, errorThrown) {
       let response = JSON.parse(jqXHR.responseText);
       $("#error").html("Error: " + response.message);
       $("#error").show();
     }); }
}

function showUpdateForm() {
  $("#emailNew").val("");   
  $("#fullNameNew").val("");     
  $("#updateControl").hide();   
  $("#updateForm").slideDown();  
}

function showReplaceDeviceForm() {
  $("#deviceIdOld").val("");   
  $("#deviceIdNew").val("");     
  $("#replaceDeviceControl").hide();   
  $("#replaceDeviceForm").slideDown();  
}

function showUVThresholdForm() {
  $("#uv").val("");        
  $("#uvThresholdControl").hide();   
  $("#uvThresholdForm").slideDown();  
}

function showSpeedThresholdForm() {
  $("#gpsSpeed").val("");   
     
  $("#speedThresholdControl").hide();   
  $("#speedThresholdForm").slideDown();  
}


function hideUpdateForm() {
  $("#updateControl").show();  // Hide the add device link
  $("#updateForm").slideUp();  // Show the add device form
  $("#ServerResponse").hide();
}

function hideReplaceDeviceForm() {
  $("#replaceDeviceControl").show();  // Hide the add device link
  $("#replaceDeviceForm").slideUp();  // Show the add device form
  $("#error").hide();
}


function hideUVThresholdForm() {
  $("#uvThresholdControl").show();  // Hide the add device link
  $("#uvThresholdForm").slideUp();  // Show the add device form
  $("#error").hide();
}

function hideSpeedThresholdForm() {
  $("#speedThresholdControl").show();  // Hide the add device link
  $("#speedThresholdForm").slideUp();  // Show the add device form
  $("#error").hide();
}


// Handle authentication on page load
$(function() {
  // If there's no authToekn stored, redirect user to 
  // the sign-in page (which is index.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
  }
  else {
    sendReqForAccountInfo();
  }
  
  // Register event listeners
  $("#addDevice").click(showAddDeviceForm);
  $("#registerDevice").click(registerDevice);  
  $("#cancel").click(hideAddDeviceForm);    

  $("#deleteDeviceControl").click(showDeleteDeviceForm);
  $("#deleteDevice").click(function(event){
    deleteDevice(event, $("#deleteDeviceId").val());
  });  
  $("#deleteCancel").click(hideDeleteDeviceForm); 

  $("#updateAccount").click(showUpdateForm);
  $("#update").click(updateAccount); 
  $("#updateCancel").click(hideUpdateForm);  

  $("#summaryDevice").click(showSummaryDeviceForm);
  $("#summary").click(function(event){summaryDevice(event, $("#summaryDeviceId").val());});  
  $("#summaryCancel").click(hideSummaryDeviceForm); 

  $("#replaceDevice").click(showReplaceDeviceForm);
  $("#replace").click(replaceDevice); 
  $("#replaceCancel").click(hideReplaceDeviceForm);  

  $("#uvThreshold").click(showUVThresholdForm);
  $("#registerUV").click(registerUV); 
  $("#uvCancel").click(hideUVThresholdForm);  

  $("#speedThreshold").click(showSpeedThresholdForm);
  $("#registerSpeed").click(registerSpeed); 
  $("#speedCancel").click(hideSpeedThresholdForm);  


  
  

});
