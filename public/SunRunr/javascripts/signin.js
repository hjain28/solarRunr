function sendSigninRequest() {
  let email = $('#email').val();
  let password = $('#password').val();
  
  $.ajax({
    url: '/users/signin',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ email : email, password : password }), 
    dataType: 'json'
  })
    .done(signinSuccess)
    .fail(signinError);
}

function signinSuccess(data, textSatus, jqXHR) {
  // TODO
  window.localStorage.setItem('authToken', data.authToken);
  window.location = "account.html";
}

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  //console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  //console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  let email = profile.getEmail();
  let password = "@Rishab123456";
  let name =  profile.getName();


  $.ajax({
    url: '/users/signin',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ email : email, password : password}), 
    dataType: 'json'
  })
    .done(signinSuccess)
    .fail(signinError);
}

function registerSuccess(data, textStatus, jqXHR) {
  if (data.success) {  
    window.location = "index.html";
  }
  else {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Error: " + data.message + "</span>");
    $('#ServerResponse').show();
  }
}

function registerError(jqXHR, textStatus, errorThrown) {
  if (jqXHR.statusCode == 404) {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Server could not be reached.</p>");
    $('#ServerResponse').show();
  }
  else {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Error: " + jqXHR.responseJSON.message + "</span>");
    $('#ServerResponse').show();
  }
}

function signinError(jqXHR, textStatus, errorThrown) {
  if (jqXHR.statusCode == 404) {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Server could not be reached.</p>");
    $('#ServerResponse').show();
  }
  else if (jqXHR.statusCode == 404){
     $('#ServerResponse').html("<span class='red-text text-darken-2'>User Needs to register first</p>");
     $('#ServerResponse').show();
      window.location = "register.html";
  }
  else {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Error: " + jqXHR.responseJSON.message + "</span>");
    $('#ServerResponse').show();
  }
}

// Handle authentication on page load
$(function() {  
  // TODO 
  if( window.localStorage.getItem('authToken')) {
    window.location.replace('account.html');
  }
  else {
    $('#signin').click(sendSigninRequest);
    $('#google').click(onSignIn);
     $('#password').keypress(function(event) {
        if( event.which === 13 ) {
           sendSigninRequest();
        }
     });
  }
});
