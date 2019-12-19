var db = require("../db");

var thresholdSchema = new db.Schema({
    uvthreshold:  {type: Number, default : 4},
    gpsSpeedthreshold: {type : Number, default: 8},
    userEmail:    String
});

var Threshold = db.model("Threshold", thresholdSchema);

module.exports = Threshold;
