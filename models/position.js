var db = require("../db");

var positionSchema = new db.Schema({
    loc:           { type: [Number], index: '2dsphere'},
    latitude : Number, 
    longitude : Number,
    deviceId : String,	    
    uv:		   Number,
    gpsSpeed:      Number,
    lastReported:  { type: Date, default: Date.now },
    firstReported: { type: Date, default: Date.now }
});

var Position = db.model("Position", positionSchema);

module.exports = Position;
