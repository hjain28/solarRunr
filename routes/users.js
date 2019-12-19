let express = require('express');
let router = express.Router();
let User = require("../models/users");
let Token = require("../models/token");

let Device = require("../models/device");
let fs = require('fs');
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");

//email verification
var nodemailer = require('nodemailer');
var crypto = require('crypto');
//var sgTransport = require('nodemailer-sendgrid-transport');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/* Authenticate user */
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();


router.post('/signin', function(req, res, next) {
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
       res.status(401).json({success : false, message : "Can't connect to DB."});         
    }
    else if(!user) {
       res.status(401).json({success : false, message : "Email or password invalid."});         
    }
    else {
      bcrypt.compare(req.body.password, user.passwordHash, function(err, valid) {
         if (err) {
           res.status(401).json({success : false, message : "Error authenticating. Contact support."});         
         }
         else if(valid) {
            var authToken = jwt.encode({email: req.body.email}, secret);
            res.status(201).json({success:true, authToken: authToken});
         }
         else {
            res.status(401).json({success : false, message : "Email or password invalid."});         
         }
         
      });
    }
  });
});

/* Register a new user */
router.post('/register', function(req, res, next) {
   
   bcrypt.hash(req.body.password, 10, function(err, hash) {
      if (err) {
         console.log("EROOR IS HERE1");
         res.status(400).json({success : false, message : err.errmsg});         
      }
      else {
        var newUser = new User ({
            email: req.body.email,
            fullName: req.body.fullName,
            passwordHash: hash
        });
        
        newUser.save(function(err, user) {
          if (err) {
            console.log("EROOR IS Here2");
             res.status(400).json({success : false, message : err.errmsg});         
          }
          else {
             res.status(201).json({success : true, message : user.fullName + "has been created"});                      
          }
          //for emailverification
          var tokens = new Token({_userId: newUser.email, token: crypto.randomBytes(16).toString('hex')});
          tokens.save(function(err, token){
          if(err){
            console.log("Under save - error =  " + err+ "*************************");
              return res.status(500).json({message: err.errmsg});
            }
            
            
            var transporter = nodemailer.createTransport({ 
                                                            service: 'Sendgrid', 
                                                            auth: {
                                                                   user: process.env.SENDGRID_USERNAME, 
                                                                   pass: process.env.SENDGRID_PASSWORD 
                                                                  } 
                                                          });
            //console.log("The error is == " + error + "****");

            var mailOptions = { 
                              from: 'no-reply@sunrunr.com', 
                              to: req.body.email, 
                              subject: 'Account Verification Token', 
                              text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' 
                            };
            const msg = {
                         to: req.body.email,
                         from: 'test@sunrunr.com',
                         subject: 'Confirm email for Sunrunr Login',
                         text: 'and easy to do anywhere, even with Node.js',
                         html: '<strong> Please confirm your email address by clicking <a href="http://ec2-3-134-83-126.us-east-2.compute.amazonaws.com:3000/index.html">here</a>',

                        };
            sgMail.send(msg);
            // transporter.verify(function(error, success){
            //   if (error) {
            //     console.log("THe error is == " + error + "****");
            //   } else {
            //      console.log("Server is ready to take our messages");
            //   }
            // });


            //transporter.sendMail(mailOptions, function (err) {


             // if (err) { console.log(err+ "22222*************************"); return res.status(500).json({ messsage: err.errmsg }); }

             //    res.status(200).json('A verification email has been sent to ' + newUser.email + '.');              
 
            //});
          });
        });
      }
   });   
});

router.get("/account" , function(req, res) {
   // Check for authentication token in x-auth header
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   
   var authToken = req.headers["x-auth"];
   
   try {
      var decodedToken = jwt.decode(authToken, secret);
      var userStatus = {};
      
      User.findOne({email: decodedToken.email}, function(err, user) {
         if(err) {
            return res.status(400).json({success: false, message: "User does not exist."});
         }
         else {
            userStatus['success'] = true;
            userStatus['email'] = user.email;
            userStatus['fullName'] = user.fullName;
            userStatus['lastAccess'] = user.lastAccess;
            
            // Find devices based on decoded token
          Device.find({ userEmail : decodedToken.email}, function(err, devices) {
            if (!err) {
               // Construct device list
               let deviceList = []; 
               for (device of devices) {
                 deviceList.push({ 
                       deviceId: device.deviceId,
                       apikey: device.apikey,
                 });
               }
               userStatus['devices'] = deviceList;
            }
            
               return res.status(200).json(userStatus);            
          });
         }
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
});

router.post("/update" , function(req, res){
  let decodedToken = jwt.decode(req.headers["x-auth"], secret);
  var userStatus = {};

Device.find({userEmail: decodedToken.email}, function(err,device){
  for(var doc of device){
    Device.updateOne({userEmail: decodedToken.email}, {userEmail: req.body.email}, function(err, device){
    if(err) {
            return res.status(400).json({success: false, message: "Device does not exist."});
         }
    else{
     return res.status(200);

    }
  });
  }
 return res.status(200);
});


  User.updateOne({email: decodedToken.email}, {email: req.body.email, fullName: req.body.fullName}, function(err, user){
    if(err) {
            return res.status(400).json({success: false, message: "User does not exist."});
         }
    else{
  userStatus['success'] = true;
        userStatus['email'] = user.email;
        userStatus['fullName'] = user.fullName;
        userStatus['lastAccess'] = user.lastAccess;
     return res.status(200).json(userStatus);

    }
  });   
});

module.exports = router;
