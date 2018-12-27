var mysql = require('mysql');
require("dotenv").config();
console.log("Host:",process.env.host);
var settings = {
    host: process.env.host,
    user: "gokul",
    password: "pwdpwdpwd",
    database: "authentication"
}

var db;

function connectDatabase() {
    if (!db) {
        db = mysql.createConnection(settings);
        console.log(process.env.profile);
        db.connect(function(err){
            if(!err) {
                console.log('Database is connected!');
            } else {
                console.log('Error connecting database!');
            }
        });
    }
    return db;
}

module.exports = connectDatabase();
