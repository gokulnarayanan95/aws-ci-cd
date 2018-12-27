const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const path = require("path");
const uuid = require("uuid");
const multer = require("multer");
const fs = require('fs');
const AWS = require('aws-sdk');
var multerS3 = require('multer-s3');
var time = require('./routes/time');
var register = require('./routes/register');
var transaction = require('./routes/transaction');
var trackId;
var returnObj;
var app = express();
const s3 = new AWS.S3();
var logger = require('./config/winston').logger;
var USERID = 3;
var SDC = require('statsd-client')
var sdc = new SDC({host: 'localhost', port: 8125, debug: true});
const userValidator = require("./validators/user-validator");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const DBName = 'Authentication';

// Create connection
const db = mysql.createConnection({
    host     :  process.env.host,
    user     : 'gokul',
    password : 'pwdpwdpwd',
    database : 'authentication'
});

// Connect
db.connect((err) => {
    if(err){
        logger.error(err)
        throw err;
        
    }
    logger.info("Congrats,MYSQL Connected")
    console.log('MySql Connected...');
});


require("dotenv").config();
let currentProfile = process.env.profile;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


fs.mkdir('./uploads', err => { 
    logger.error(err)
    console.log(err);
    });


app.use('/time', time);
app.use('/user/register', register);
app.use('/transaction', transaction);

app.use('/resetpassword',(req, res) => {
    resetpassword(req,res);
});
app.use('/cleardata',(req,res)=>{
    if(req.body.username=='jmeteradmin001'&&req.body.password=='jmeteradmin001'){
        var deleteAll='delete from auth'
        db.query(deleteAll,(err,result)=> {
            if (err)
             throw err;
            if(result){
                let delete2 = 'delete from transaction'
                db.query(delete2, (err2, result2) => {
                    if(err2)
                        throw err2;
                    if(result2){
                        let delete3 = 'delete from attachmentlog'
                        db.query(delete3, (err3, result3) => {
                            if(err3)
                                throw err3;
                            if(result3){
                                res.status(200).send({"SuccessMessage": "Congrats, tables have been cleared"});
                            }
                        });
                    }
                });

        }
    });
}
    else{
        res.status(401).send();
    }
});
function resetpassword(req,res){
    sdc.increment('/resetpassword')
    logger.info("/Reset Password end point has been hit")

    userValidator.userExists(req.body.username, function (err, isValid) {
        if(isValid){
    AWS.config.update({region: 'us-east-1'});


  
    // Create promise and SNS service object

    var listTopicsPromise = new AWS.SNS({apiVersion: '2010-03-31'}).listTopics({}).promise();


    // handle promise's fulfilled/rejected states

    listTopicsPromise.then(

    function(data) {
        data.Topics.forEach (function(row) {

            

            var params = {

                Message: req.body.username, /* required */

                TopicArn: row.TopicArn,

              };
              

              // Create promise and SNS service object

              var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

              // handle promise's fulfilled/rejected states

              publishTextPromise.then(

                function(data) {
                  console.log("Message "+params.Message+" send sent to the topic"+params.TopicArn);

                  console.log("MessageID is " + data.MessageId);
                  logger.info("The message ID is" + data.MessageId)

                  res.send({"Message":"ok"});

                }).catch(

                  function(err) {

                  console.error(err, err.stack);

              });

        })

    }).catch(

        function(err) {
        
            logger.error(err)
        console.error(err, err.stack);

    });
    }
    else {
        res.send({"errorMessage":"User does not exist"});
    }
    });
    
}

app.listen('80', () => {

logger.info("Server started on port 80")    
console.log('Server started on port 80');
});
