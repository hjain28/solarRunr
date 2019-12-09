let express = require('express');
let router = express.Router();
let Device = require("../models/device");
let fs = require('fs');
let jwt = require("jwt-simple");
let Position = require("../models/position");

/* Authenticate user */
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
  let newApikey = "";
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
  for (let i = 0; i < 32; i++) {
    newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return newApikey;
}

router.post("/replace" , function(req, res){
let responseJson = {
    registered: false,
    message : "",
    apikey : "none",
    deviceId : "none"
  };

Device.findOne({deviceId: req.body.deviceId}, function(err,device){
    Device.updateOne({deviceId: req.body.deviceId}, {deviceId: req.body.deviceIdNew}, function(err, device){ if (device == null) {
      responseJson.message = "Device ID " + req.body.deviceId + " is invalid.";
      return res.status(400).json(responseJson);
    }
    else if(err) {
      let errorMsg = {"message" : err};
      res.status(400).json(errorMsg);
         }
    else{
        return res.status(200).json({success: true, message: "Device is replaced."});
        }
      });
  });
});


// GET request return one or "all" devices registered and last time of contact.
router.get('/status/:devid', function(req, res, next) {
  let deviceId = req.params.devid;
  let responseJson = { devices: [] };

  if (deviceId == "all") {
    let query = {};
  }
  else {
    let query = {
      "deviceId" : deviceId
    };
  }
  
  Device.find(query, function(err, allDevices) {
    if (err) {
      let errorMsg = {"message" : err};
      res.status(400).json(errorMsg);
    }
    else {
      for(let doc of allDevices) {
        responseJson.devices.push({ "deviceId": doc.deviceId,  "lastContact" : doc.lastContact});
      }
    }
    res.status(200).json(responseJson);
  });
});

router.post('/register', function(req, res, next) {
  let responseJson = {
    registered: false,
    message : "",
    apikey : "none",
    deviceId : "none"
  };
  let deviceExists = false;
  
  // Ensure the request includes the deviceId parameter
  if( !req.body.hasOwnProperty("deviceId")) {
    responseJson.message = "Missing deviceId.";
    return res.status(400).json(responseJson);
  }

  let email = "";
    
  // If authToken provided, use email in authToken 
  if (req.headers["x-auth"]) {
    try {
      let decodedToken = jwt.decode(req.headers["x-auth"], secret);
      email = decodedToken.email;
    }
    catch (ex) {
      responseJson.message = "Invalid authorization token.";
      return res.status(400).json(responseJson);
    }
  }
  else {
    // Ensure the request includes the email parameter
    if( !req.body.hasOwnProperty("email")) {
      responseJson.message = "Invalid authorization token or missing email address.";
      return res.status(400).json(responseJson);
    }
    email = req.body.email;
  }
    
  // See if device is already registered
  Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
    if (device !== null) {
      responseJson.message = "Device ID " + req.body.deviceId + " already registered.";
      return res.status(400).json(responseJson);
    }
    else {
      // Get a new apikey
     deviceApikey = getNewApikey();
      
      // Create a new device with specified id, user email, and randomly generated apikey.
      let newDevice = new Device({
        deviceId: req.body.deviceId,
        userEmail: email,
        apikey: deviceApikey
      });

      // Save device. If successful, return success. If not, return error message.
      newDevice.save(function(err, newDevice) {
        if (err) {
          responseJson.message = err;
          // This following is equivalent to: res.status(400).send(JSON.stringify(responseJson));
          return res.status(400).json(responseJson);
        }
        else {
          responseJson.registered = true;
          responseJson.apikey = deviceApikey;
          responseJson.deviceId = req.body.deviceId;
          responseJson.message = "Device ID " + req.body.deviceId + " was registered.";
          return res.status(201).json(responseJson);
        }
      });
    }
  });
});

router.post('/ping', function(req, res, next) {
    let responseJson = {
        success: false,
        message : "",
    };
    let deviceExists = false;
    
    // Ensure the request includes the deviceId parameter
    if( !req.body.hasOwnProperty("deviceId")) {
        responseJson.message = "Missing deviceId.";
        return res.status(400).json(responseJson);
    }
    
    // If authToken provided, use email in authToken 
    try {
        let decodedToken = jwt.decode(req.headers["x-auth"], secret);
    }
    catch (ex) {
        responseJson.message = "Invalid authorization token.";
        return res.status(400).json(responseJson);
    }
    
    request({
       method: "POST",
       uri: "https://api.particle.io/v1/devices/" + req.body.deviceId + "/pingDevice",
       form: {
         access_token : particleAccessToken,
         args: "" + (Math.floor(Math.random() * 11) + 1)
        }
    });
            
    responseJson.success = true;
    responseJson.message = "Device ID " + req.body.deviceId + " pinged.";
    return res.status(200).json(responseJson);
});

router.post('/delete', function(req, res, next) {
  let responseJson = {
    registered: false,
    message : "",
    apikey : "none",
    deviceId : "none"
  };
  let deviceExists = false;
  
  // Ensure the request includes the deviceId parameter
  if( !req.body.hasOwnProperty("deviceId")) {
    responseJson.message = "Missing deviceId BROOOOO.";
    return res.status(400).json(responseJson);
  }

  let email = "";
    
  // If authToken provided, use email in authToken 
  if (req.headers["x-auth"]) {
    try {
      let decodedToken = jwt.decode(req.headers["x-auth"], secret);
      email = decodedToken.email;
    }
    catch (ex) {
      responseJson.message = "Invalid authorization token.";
      return res.status(400).json(responseJson);
    }
  }
  else {
    // Ensure the request includes the email parameter
    if( !req.body.hasOwnProperty("email")) {
      responseJson.message = "Invalid authorization token or missing email address.";
      return res.status(400).json(responseJson);
    }
    email = req.body.email;
  }
    
  // See if device is already registered
  Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
    if (device == null) {
      responseJson.message = "Device ID " + req.body.deviceId + " is invalid.";
      return res.status(400).json(responseJson);
    }
    else {

      // Save device. If successful, return success. If not, return error message.
      Device.remove({deviceId: req.body.deviceId},function(err) {
        if (err) {
          responseJson.message = err;
          // This following is equivalent to: res.status(400).send(JSON.stringify(responseJson));
          return res.status(400).json(responseJson);
        }
        else {
          responseJson.message = "Device ID " + req.body.deviceId + " was removed.";
          return res.status(201).json(responseJson);
        }
      });
    }
  });
});

/*

router.get('/summary', function(req, res, next) {

if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   
   var authToken = req.headers["x-auth"];
   
   try {
      var decodedToken = jwt.decode(authToken, secret);

  let responseJson = { devices: [] };
  
  Position.findOne({deviceId: decodedToken.deviceId }, function(err, position) {
  console.log("1121");
    if (err) {
      let errorMsg = {"message" : err};
      res.status(400).json(errorMsg);
    }
    else {
     ("#deviceId").html(position.deviceId);
     ("#longitude").html(position.longitude);
     ("#latitude").html(position.latitude);
     ("#uv").html(position.uv);
     ("#speed").html(position.gpsSpeed);

    }
    res.status(200).json(responseJson);
  });
 }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }

});
*/
router.post('/summary', function(req, res, next) {

    
      
    var deviceId = req.body.deviceId;
    console.log(deviceId + "HEREE******");
    

    let deviceExists = false;
    return res.status(201).json("brooo");


  
  // Ensure the request includes the deviceId parameter
  // if( !req.body.hasOwnProperty("deviceId")) {
  //   console.log("1.5*********");
  //   responseJson.message = "Missing deviceId BROOOOO.";
  //   return res.status(400).json(responseJson);
  // }
  // console.log("2*********");
  // let email = "";
    
  // // If authToken provided, use email in authToken 
  // if (req.headers["x-auth"]) {
  //   try {
  //     let decodedToken = jwt.decode(req.headers["x-auth"], secret);
  //     email = decodedToken.email;

  //   }
  //   catch (ex) {
  //     responseJson.message = "Invalid authorization token.";
  //     return res.status(400).json(responseJson);
  //   }

  // }
  // else {
  //   // Ensure the request includes the email parameter
  //   if( !req.body.hasOwnProperty("email")) {
  //     responseJson.message = "Invalid authorization token or missing email address.";
  //     return res.status(400).json(responseJson);
  //   }
  //   email = req.body.email;
  // }
  // console.log("3*********");
  // // See if device is already registered
  //  return res.status(201).json(responseJson);
  // Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
  //   if (device == null) {
  //     responseJson.message = "Device ID " + req.body.deviceId + " is invalid.";
  //     return res.status(400).json(responseJson);
  //   }
  //   else {
  //       return res.status(201).json(responseJson);
  //     // Save device. If successful, return success. If not, return error message.
  //   }
  // });



//    Position.find(query, function(err, positions){    

//    if(err){
//      res.status(400).json("Device Id not found in DATABASE");
//      return; 
//    }

//    else {
//      for(var value of positions){
  
//        var string = JSON.stringify(value);
//        var entries = JSON.parse(string);
//        returnJson += "deviceID = " + entries.deviceId + " Longitude = " + entries.longitude +  "  Latitude = " + entries.latitude + " uv = " + entries.uv +  " gpsSpeed = " + entries.gpsSpeed + 
// "                                                                                                               ";
//      }
      
//      res.status(200).json(returnJson);
//      return;
      
//    }
//  });
  
});
module.exports = router;