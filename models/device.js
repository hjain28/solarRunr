var db = require("../db");

var deviceSchema = new db.Schema({
    apikey:       String,
    deviceId:     String,
    uvthreshold:  {type: Number, default : 4},
    speedthreshold: {type : Number, default: 8},
    userEmail:    String,
    lastContact:  { type: Date, default: Date.now }
});

var Device = db.model("Device", deviceSchema);

module.exports = Device;
