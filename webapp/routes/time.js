const express = require("express");
const bcrypt = require("bcrypt");
var router = express.Router();
var db = require('../db');
const userValidator = require("../validators/user-validator");
var logger = require("../config/winston").logger
var SDC = require('statsd-client')
var sdc = new SDC({host: 'localhost', port: 8125, debug: true});

var SDC = require('statsd-client')
var sdc = new SDC({host: 'localhost', port: 8125, debug: true});

router.get("/", (req, res) => {
        logger.info("/time endpoint has been hit")
        sdc.increment('/time')
        if (req.headers.authorization) {
        let credentials = new Buffer(
            req.headers.authorization.split(" ")[1],
            "base64"
        ).toString();
        let username = credentials.split(":")[0];
        let password = credentials.split(":")[1];
        userValidator.userValidation(username,password,function(err,isValid){
            if(isValid){
                logger.info("Congrats, you are a valid user")
                res.setHeader("Content-Type", "application/json");
                    res.send(JSON.stringify({
                        time: new Date()
                    }));
            }
            else{
                logger.info("Please, check your credentials and try again!")
                res.send(
                    JSON.stringify({
                        errorMessage: "Please check your credentials and try again"
                    })
                );
            }
        });

    } else {
        logger.error("Please login using a username and a password")
        res.send(
            JSON.stringify({
                errorMessage: "Please login using username and password"
            })
        );
    }
});

module.exports= router;