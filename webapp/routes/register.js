const express = require("express");
const bcrypt = require("bcrypt");
var router = express.Router();
var db = require('../db');
const emailValidator = require("../validators/email-validator");
var logger = require("../config/winston").logger

var SDC = require('statsd-client')
var sdc = new SDC({host: 'localhost', port: 8125, debug: true});

router.post("/", (req, res) => {
    logger.info("/user/register end point has been hit")
    sdc.increment('/user/register')
    res.setHeader("Content-Type", "application/json");

    var responseJSON = {};
    var hashedPassword;
    console.log(req.body.password);
    bcrypt.hash(req.body.password, parseInt(10), function (err, hash) {
        if(err) {
            logger.error(err)
            console.log(err)
        }
        hashedPassword = hash;
        console.log("Hashed password", hashedPassword)

        //connect to db
        let sql = `select * from auth where username = '${req.body.username}'`;
        db.query(sql, (err, result) => {
            if (err) throw err;
            console.log(result.length);
            if (result.length === 0) {
                if (!emailValidator.validation(req.body.username)) {
                    logger.info("Please follow the email convention")
                    return res.send({ errorMessage: "Please follow the email convention" })
                }
                let insertSql = `insert into auth values('${
                    req.body.username
                    }','${hashedPassword}')`;
                db.query(insertSql, (err, result) => {
                    if (err) throw err;
                    // console.log("SSSSSS")
                    responseJSON = {
                        successMessage: "Congrats , a new user has been added"
                    };
                    logger.info("Congrats, A new user has been added")
                    res.send(JSON.stringify(responseJSON));
                });
            } else {
                responseJSON = {
                    errorMessage: "Sorry, the username aldready exists , try with a different username"
                };
                res.send(JSON.stringify(responseJSON));
            }
        });
    });
});

module.exports= router;
