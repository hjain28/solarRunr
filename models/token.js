var db = require("../db");

var tokenSchema = new db.Schema({
    _userId: { type: String, required: true, ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 3600 }
});
var Token = db.model("Token", tokenSchema);

module.exports = Token;
