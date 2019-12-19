var db = require("../db");

var positionSchema = new db.Schema({
    //loc:           { type: [Number], index: '2dsphere'},
    latitude : Number, 
    longitude : Number,
    deviceId : String,	    
    uv:		   Number,
    gpsSpeed:      Number,
    activitytime: { type: Date, default: Date.now },
    activityNumber :  Number
});

var Position = db.model("Position", positionSchema);

module.exports = Position;
