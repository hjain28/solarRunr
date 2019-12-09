function sendRegisterRequest() {
  let email = $('#email').val();
  let password = $('#password').val();
  let fullName = $('#fullName').val();
  let passwordConfirm = $('#passwordConfirm').val();
  
  // Check to make sure the passwords match
  // FIXME: Check to ensure strong password 
  let emailRe = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
  let passwordUpperRe = /[A-Z]+/;
  let passwordRe = /[a-z]+/;
  let passwordNumRe = /[0-9]+/;
  let passwordSpecialRe =/[#?!@$%^&*-.]/;
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
  
  if(password.length <10 || password.length >20){
	$('#ServerResponse').append("<span class='red-text text-darken-2'><li>Password must be between 10 and 20 characters.</li></span>");
	isValid = false;
	}
	
  if(!passwordRe.test(password)){
	$('#ServerResponse').append("<span class='red-text text-darken-2'><li>Password must contain at least one lowercase character.</li></span>");
    isValid = false;
	}
	
  if(!passwordUpperRe.test(password)){
	$('#ServerResponse').append("<span class='red-text text-darken-2'><li>Password must contain at least one uppercase character.</li></span>");
    isValid = false;
   }
  
  if(!passwordNumRe.test(password)){
    $('#ServerResponse').append("<span class='red-text text-darken-2'><li>Password must contain at least one digit.</li></span>");
    isValid = false;
	}

  if(!passwordSpecialRe.test(password)){
    $('#ServerResponse').append("<span class='red-text text-darken-2'><li>Password must contain at least one special character (#, ?, !, @, $, %, ^, &, *, -, .).</li></span>");
    isValid = false;
	}

  
  if (password != passwordConfirm) {
    $('#ServerResponse').append("<span class='red-text text-darken-2'><li>Passwords do not match.</li></span>");
    isValid = false;
  }
  
  if(isValid == false){
	$('#ServerResponse').show();
	return;
  }
  
  $.ajax({
   url: '/users/register',
   type: 'POST',
   contentType: 'application/json',
   data: JSON.stringify({email:email, fullName:fullName, password:password}),
   dataType: 'json'
  })
    .done(registerSuccess)
    .fail(registerError);
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

$(function () {
  $('#signup').click(sendRegisterRequest);
});

