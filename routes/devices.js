let express = require('express');
let router = express.Router();
let Device = require("../models/device");
let fs = require('fs');
let jwt = require("jwt-simple");
let Position = require("../models/position");
let Threshold = require("../models/threshold");    //**
//let sync = require('synchronize');
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


//****************
router.post('/uvthreshold', function(req,res, next) {
 let  responseJson = {message : ""};
 let email= "";
  if (req.headers["x-auth"]) {
    try {
      let decodedToken = jwt.decode(req.headers["x-auth"], secret);
      email = decodedToken.email;
    }
    catch (ex) {
      responseJson.message = "Invalid authorization token while putting threshold values.";
      return res.status(400).json(responseJson);
    }
  }
  else {
    // Ensure the request includes the email parameter
    if( !req.body.hasOwnProperty("email")) {
      responseJson.message = "Invalid authorization token or missing email address while putting threshold values.";
      return res.status(400).json(responseJson);
    }
    email = req.body.email;
  }

  if(!req.body.hasOwnProperty("uv")){
    responseJson.message = "Missing threshold of UV.";
    return res.status(400).json(responseJson);
  }
  else{
  Threshold.findOne({userEmail: email}, function(err,data){
    if (data == null){
       let newthreshold = new Threshold({
        userEmail  : email,
        uvthreshold : req.body.uv
        });
       console.log("checkpoint  1");
       newthreshold.save(function(err, newthreshold){
        if (err){
          responseJson.message = err ;
          return res.status(400).json(responseJson);
        }
        else {
        responseJson.message =  "UV is saved." ;
        return res.status(201).json(responseJson);
       }
       });

    }
    else{
        console.log("checkpoint2");
        console.log(req.body.uv);
        Threshold.updateOne({userEmail:email}, {$set: {uvthreshold :req.body.uv}});
    }
  });
  }
});

router.post("/speedthreshold", function(req,res,next) {
 let  responseJson = {message : ""};
 let email= "";
  if (req.headers["x-auth"]) {
    try {
      let decodedToken = jwt.decode(req.headers["x-auth"], secret);
      email = decodedToken.email;
    }
    catch (ex) {
      responseJson.message = "Invalid authorization token while putting threshold values.";
      return res.status(400).json(responseJson);
    }
  }
  else {
    // Ensure the request includes the email parameter
    if( !req.body.hasOwnProperty("email")) {
      responseJson.message = "Invalid authorization token or missing email address while putting threshold values.";
      return res.status(400).json(responseJson);
    }
    email = req.body.email;
  }


  if(!req.body.hasOwnProperty("gpsSpeed")){
    responseJson.message = "Missing threshold of gpsSpeed.";
    return res.status(400).json(responseJson);
  }
  else{
    Threshold.findOne({userEmail: email}, function(err,data){
    if (data == null){
       let newthreshold = new Threshold({
        userEmail  : email,
        gpsSpeedthreshold : req.body.gpsSpeed
        });
       console.log("checkpoint 3");
       newthreshold.save(function(err, newthreshold){
        if (err){
          responseJson.message = err ;
          return res.status(400).json(responseJson);
        }
        
        else {
          responseJson.message = "gpsSpeed is saved";
          return res.status(201).json(responseJson);
        }
       });

    }
    else{
        console.log("checkpoint4");
        Threshold.updateOne({userEmail : email}, {$set : {uvthreshold :req.body.gpsSpeed}});
    }
  });
  }
});

//***********************************

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
//******************************************  
 let uv = 0;
  let  gpsSpeed = 0;
 

Threshold.findOne({userEmail : email}, function(err, data){
    
   if (data){
      uv  =  data["uvthreshold"];
      gpsSpeed = data["gpsSpeedthreshold"];
      console.log("check 5");
      console.log(uv);
      console.log(gpsSpeed);
    }
    else {
      responseJson.message = "One of the uv and gpsSpeed threshold value is missing";
      return res.status(400).json(responseJson);
    }
  });
  
  console.log("check 6");
  console.log(uv);
  console.log(gpsSpeed);

//***************************************************

  // See if device is already registered
  Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
    if (device !== null) {
      responseJson.message = "Device ID " + req.body.deviceId + " already registered.";
      return res.status(400).json(responseJson);
    }
    else {
        deviceApikey = getNewApikey();
      
      // Create a new device with specified id, user email, and randomly generated apikey.
      let newDevice = new Device({
        uvthreshold : uv ,                                      ////////***
        speedthreshold: gpsSpeed,                               ////////********
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

router.post('/summary', function(req, res, next) {

    responsejson = { success: false, message : ""} ; 
    if (!req.headers["x-auth"]) {
      responsejson.message  = "no authentication token.";
      return res.status(401).json(responsejson);
    }
    let deda = date(date.now());
    let da = deda.tostring();
    let responsedata = { deviceid: req.body.deviceid, 
           wdate : da, cdate : da, rdate : da,
          totalduration: 0, 
          wduration: 0, cduration: 0, rduration:0,            
          totalcalories: 0, 
          wcalories: 0,rcalories :0, ccalories: 0, 
          totaluv: 0, 
          wuv: 0, ruv: 0, cuv : 0     
            }; 
    return res.status(200).json(responsedata);
  
    let uvthresh =  8;
      let speedthresh = 4;
    
    
      device.findone({deviceid: req.body.deviceid}, function(err,device){
      responsejson.message = "device id " + req.body.deviceid + " is invalid.";
      if(device == null) {
              responsejson.message = "device id" + req.body.deviceid + "is invalid";
              return res.status(400).json(responsejson);
         }
      else{
              uvthresh = device["uvthreshold"];
              speedthresh  = device["speedthreshold"];
      }
      });
     


          let psoitiondata = {lon :Number, lat : Number, uv: Number, date: Date.now()}
          let positionstatus = {running :[],walking: [],cycling:[]};
         /* let responsedata = { deviceid: req.body.deviceid, 
           wdate : {type :date, default: date.now()} , cdate : {type:date, default : date.now()}, rdate : {type:date, default:date.now()},
          totalduration: {type :string , default :"0 sec"}, 
          wduration:{type :string , default :"0 sec"}, cduration:{type :string , default :"0 sec"}, rduration:{type :string , default :"0 sec"},            totalcalories: {type : number, default :0}, 
          wcalories: {type:number, default: 0},rcalories :{type:number, default: 0}, ccalories:  {type:number, default: 0}, 
          totaluv: {type : number,default :0}, 
          wuv:  {type:number, default: 0}, ruv: {type: number, default :0}, cuv : {type: number, default:0}      
            }; */
          
    
 
     position.find({deviceid: req.body.deviceid }, function(err, position) {
        if(position == null){
          responsejson.message = "position is not registerd with device id yet.";  
          return  res.status(201).json(responsejson);
        }
        else{
              let activity_ = 1;
              for(var value of position){
                    positiondata['lon'] = value.longitude;
                    positiondata['lat'] = value.latitude;
                    positiondata['uv'] = value.uv;
                    positiondata['date'] = value.activitytime;

                    if (value.activitynumber == activity_){
                        if ((value.gpsspeed > 0) && value.gpsspeed < speedthrash){
                            positionstatus.walking.push(positiondata);
                        }
                        else if ((value.gpsspeed >= speedthrash) && (value.gpsspeed < speedthrash + 5)){
                          positionstatus.running.push(positiondata);
                        }
                        else if (value.gpsspeed >= speedthrash +5){
                          positionstatus.cycling.push(positiondata);
                        }
                    }
                    else {
                        break;
                    }
              }

            let activity =[] ;
            activity = positionstatus.walking;
            let tuv =0;
            let tt = 0;
            let td =0;
            let a=0 ;
            let c =0;
            let dlat =0;
            let dlon =0;
            responsedata.wdate = activity[0].date;
            let temp1 = activity[0].lon;
            let temp2 = activity[0].lat;
            let temp3 = activity[0].date; 
            for (var act of activity){
                  tuv = tuv +  act.uv;
                  tt = tt + (act.date - temp3);
                   dlon = act.lon - temp1;
                   dlat = act.lat - temp2;
                   a  = math.pow(math.sin(dlat/2),2) + math.cos(temp2)*math.cos(act.lat)*math.pow(math.sin(dlon/2),2);
                   c  = 2*math.atan2(math.sqrt(a), math.sqrt(1-a));
                  td = td + 6373000*c;
                  temp1 = act.lon;
                  temp2 = act.lat;
                  temp3 = act.date;
            }
            responsedata.wcalories = 2.45 + 1.2*(td*1000/tt);
            responsedata.wuv = tuv;
            responsedata.wduration = tt/1000;

            activity = positionstatus.running;
           tuv =0;
            
             tt = 0;
             td =0;
            responsedata.rdate = activity[0].date;
            temp1 = activity[0].lon;
             temp2 = activity[0].lat;
           temp3 = activity[0].date;
            for (var act of activity){
                  tuv = tuv +  act.uv;
                  tt = tt + (act.date - temp3);
                 dlon = act.lon - temp1;
                   dlat = act.lat - temp2;
                   a  = math.pow(math.sin(dlat/2),2) + math.cos(temp2)*math.cos(act.lat)*math.pow(math.sin(dlon/2),2);
                   c  = 2*math.atan2(math.sqrt(a), math.sqrt(1-a));
                  td = td + 6373000*c;
                  temp1 = act.lon;
                  temp2 = act.lat;
                  temp3 = act.date;
            }
            responsedata.rcalories = 2.45+1.2*(td*1000/tt);
            responsedata.ruv = tuv;
            responsedata.rduration = tt/1000;

            activity = positionstatus.cycling;
            tuv =0;
          
            tt = 0;
            td =0;
            responsedata.cdate = activity[0].date;
            temp1 = activity[0].lon;
            temp2 = activity[0].lat;
            temp3 = activity[0].date;
            for (var act of activity){
                  tuv = tuv +  act.uv;
                  tt = tt + (act.date - temp3);
                   dlon = act.lon - temp1;
                   dlat = act.lat - temp2;
                   a  = math.pow(math.sin(dlat/2),2) + math.cos(temp2)*math.cos(act.lat)*math.pow(math.sin(dlon/2),2);
                   c  = 2*math.atan2(math.sqrt(a), math.sqrt(1-a));
                  td = td + 6373000*c;
                  temp1 = act.lon;
                  temp2 = act.lat;
                  temp3 = act.date;
            }
            responsedata.ccalories = 2.45 +1.2*(td*1000/tt);
            responsedata.cduration  = tt/1000;
            responsedata.cuv = tuv;
        
            responsedata.totalduration = responsedata.wduration + resposedata.cduration + responsedata.rduration;
            responsedata.totalcalories = responsedata.wcalories + responsedata.rcalories + responsedata.ccalories;
            responsedata.totaluv = responsedata.wuv + responsedata.ruv + responsedata.cuv;

        }    
  });
return  res.status(200).json(responsedata);
});


router.post('/lineandmap', function(req, res, next) {

    responsejson = { success: false, message : ""} ; 
    if (!req.headers["x-auth"]) {
      responsejson.message  = "no authentication token.";
      return res.status(401).json(responsejson);
    }
    let deda = date(date.now());
    let da = deda.tostring();
let responsedata = { deviceid: req.body.deviceid, 
           wdate : da, cdate : da, rdate : da,
          totalduration: 0, 
          wduration: 0, cduration: 0, rduration:0,            
          totalcalories: 0, 
          wcalories: 0,rcalories :0, ccalories: 0, 
          totaluv: 0, 
          wuv: 0, ruv: 0, cuv : 0     
            }; 
    return res.status(200).json(responsedata);
   
    let uvthresh =  8;
      let speedthresh = 4;
    
    
      device.findone({deviceid: req.body.deviceid}, function(err,device){
      responsejson.message = "device id " + req.body.deviceid + " is invalid.";
      if(device == null) {
              responsejson.message = "device id" + req.body.deviceid + "is invalid";
              return res.status(400).json(responsejson);
         }
      else{
              uvthresh = device["uvthreshold"];
              speedthresh  = device["speedthreshold"];
      }
      });
     


    let positiondata = {lon: 0, lat :0};
    let positiondata1 = { speed :0, time :  Date.now()};
    let responsedata = {LineData:[],mapData:[]};
                 
      
     position.find({deviceid: req.body.deviceid }, function(err, position) {
        if(position == null){
          responsejson.message = "position is not registerd with device id yet.";  
          return  res.status(201).json(responsejson);
        }
        else{
              let activity_ = 1;
            
              for(var value of position){
                    positiondata['lon'] = value.longitude;
                    positiondata['lat'] = value.latitude;
                    positiondata1['speed'] = value.gpsSpeed;
                    positiondata1['date'] =value.activitytime ;

                    if (value.activitynumber == activity_){
                        responseData.LineData.push(positiondata1);
                        responseData.mapData.push(positiondata);
                    }
                    else {
                        break;
                    }
              }
    }
  });
    return  res.status(200).json(responsedata);
});





module.exports = router;
