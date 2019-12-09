let express = require('express');
let router = express.Router();
let fs = require('fs');
let jwt = require("jwt-simple");
let Device = require("../models/device");
let Position = require("../models/position");
let User = require("../models/users");

// Secret key for JWT
let secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();
let authenticateRecentEndpoint = true;

function authenticateAuthToken(req) {
    // Check for authentication token in x-auth header
    if (!req.headers["x-auth"]) {
        return null;
    }
   
    let authToken = req.headers["x-auth"];
   
    try {
        let decodedToken = jwt.decode(authToken, secret);
        return decodedToken;
    }
    catch (ex) {
        return null;
    }
}

// POST: Adds reported pothole to the database and returns total hit count for the pothole
// Authentication: APIKEY. The device reporting must have a valid APIKEY
router.post("/position", function(req, res) {
    let responseJson = {
        success : false,
        message : "",
       // totalHits: 1
    };

    // Ensure the POST data include required properties                                               
    if( !req.body.hasOwnProperty("deviceId") ) {
        responseJson.message = "Request missing deviceId parameter.";
  console.log(responseJson.message);
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("apikey") ) {
        responseJson.message = "Request missing apikey parameter.";
  console.log(responseJson.message);
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("longitude") ) {
        responseJson.message = "Request missing longitude parameter.";
  console.log(responseJson.message);
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("latitude") ) {
        responseJson.message = "Request missing latitude parameter.";
  console.log(responseJson.message);
        return res.status(201).send(JSON.stringify(responseJson));
    }
//Edit
    if( !req.body.hasOwnProperty("uv") ) {
        responseJson.message = "Request missing uv parameter.";
  console.log(responseJson.message);
        return res.status(201).send(JSON.stringify(responseJson));
    }
    if( !req.body.hasOwnProperty("gpsSpeed") ) {
        responseJson.message = "Request missing gpsSpeed parameter.";
  console.log(responseJson.message);
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("time") ) {
        responseJson.message = "Request missing time parameter.";
	console.log(responseJson.message);
        return res.status(201).send(JSON.stringify(responseJson));
    }


  Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
        if (device === null) {
            responseJson.message = "Device ID " + req.body.deviceId + " not registered.";
          console.log(req.body.deviceId);   
   console.log(responseJson.message)
      return res.status(201).send(JSON.stringify(responseJson));
        }
        
        if (device.apikey != req.body.apikey) {
            responseJson.message = "Invalid apikey for device ID " + req.body.deviceId + ".";
        console.log(responseJson.message)
          return res.status(201).send(JSON.stringify(responseJson));
        }
               
        // Check to see if a pothole was already recoreded within 10 meters (or thereabouts, this needs to be verified)
        let findPositionQuery = Position.findOne({
             longitude: req.body.longitude, 
             latitude: req.body.latitude
         });

         // Execute the query     
         findPositionQuery.exec(function (err, position) {
            if (err) {
               console.log(err);
               responseJson.message = "Error accessing db.";
    console.log(responseJson.message)
               return res.status(201).send(JSON.stringify(responseJson));
             }
             
             // Pothole was found, update the hit count and last reported time
             if (position) {
                 //pothole.totalHits++;
                 position.lastReported = Date.now();
                 responseJson.message = "Position Hit recorded.";
                 //responseJson.totalHits = pothole.totalHits;
             }
             // New pothole found
             else {
                 // Create a new pothole and save the pothole to the database
                 var position = new Position({
                     //loc:[req.body.longitude, req.body.latitude],
        	           latitude : req.body.latitude,
                     longitude : req.body.longitude,
                     deviceId : req.body.deviceId,
                     lastReported: Date.now(),
                     firstReported: req.body.time,
                     uv : req.body.uv,
      		           gpsSpeed : req.body.gpsSpeed
                 });
                 responseJson.message = "*****************************New position recorded.*************************************************";
             }                

             // Save the pothole data. 
             position.save(function(err, newPosition) {
                 if (err) {
                     responseJson.status = "ERROR";
                     responseJson.message = "Error saving data in db." + err;
         console.log(responseJson.message);
                     return res.status(201).send(JSON.stringify(responseJson));
                 }

                 responseJson.success = true;
                 console.log(responseJson.message);
                 return res.status(201).send(JSON.stringify(responseJson));
            });
         });  
    });
});

// GET: Returns all potholes first reported in the previous specified number of days
// Authentication: Token. A user must be signed in to access this endpoint

router.get("/recent/:days", function(req, res) {
    let days = req.params.days;
    
    let responseJson = {
        success: true,
        message: "",
        positions: [],
    };
    
    if (authenticateRecentEndpoint) {
        decodedToken = authenticateAuthToken(req);
        if (!decodedToken) {
            responseJson.success = false;
            responseJson.message = "Authentication failed";
            return res.status(401).json(responseJson);
        }
    }
    
    
    // Check to ensure the days is between 1 and 30 (inclsuive), return error if not
    if (days < 1 || days > 30) {
        responseJson.success = false;
        responseJson.message = "Invalid days parameter.";
        return res.status(200).json(responseJson);
    }
    
    // Find all potholes reported in the spcified number of days
    let recentPositionQuery = Position.find({
        "firstReported": 
        {
            $gte: new Date((new Date().getTime() - (days * 24 * 60 * 60 * 1000)))
        }
    }).sort({ "date": -1 });
    
    
    recentPositionQuery.exec({}, function(err, recentPosition) {
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error accessing db.";
            return res.status(200).send(JSON.stringify(responseJson));
        }
        else {  
            let numRecentPosition = 0;
            //let numTotalHits = 0;      
            for (let position of recentPosition) {
                // Add pothole data to the respone's potholes array
                numRecentPosition++;
                //numTotalHits += pothole.totalHits; 
                responseJson.positions.push({
                    latitude: position.loc[1],
                    longitude: position.loc[0],
                    date: position.firstReported,
        	    uv : position.uv,
        	    gpsSpeed :position.gpsSpeed
                    //totalHits: pothole.totalHits
                });
            }
            responseJson.message = "In the past " + days + " days, " + numRecentPosition; // + " positions have been hit " + numTotalHits + " times.";
            return res.status(200).send(JSON.stringify(responseJson));
        }
    })
});

/*router.get('/summaryList/:deviceId', function(req, res, next) {
console.log("try");
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
    
  // See if device is already registered
  Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
    if (device !== null) {
      responseJson.message = "Device ID " + req.body.deviceId + " is invalid.";
      return res.status(400).json(responseJson);
    }
    else {
console.log("Return1");
      window.location = "summaryList.html";
    }
  });
});*/

module.exports = router;
