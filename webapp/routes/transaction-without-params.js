const express = require("express");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
var router = express.Router();
var db = require('../db');
const userValidator = require("../validators/user-validator");
const aws = require("../aws");


var logger = require("../config/winston").logger
var SDC = require('statsd-client')
var sdc = new SDC({host: 'localhost', port: 8125, debug: true});

router.post("/", (req, res) => {
    if (req.headers.authorization) {
        logger.info("POST TRANSACTION endpoint has been hit")
        sdc.increment('/transaction')
        let credentials = new Buffer(
            req.headers.authorization.split(" ")[1],
            "base64"
        ).toString();
        let username = credentials.split(":")[0];
        let password = credentials.split(":")[1];
        let hashedPassInDB;

        let getHashedPassword = `SELECT password from auth where username = '${username}'`;


        userValidator.userValidation(username, password, function (err, isValid) {
            if (isValid) {
                if (process.env.profile === 'dev') {
                    aws.uploadS3One(req, res, function (err) {
                        if (err) {
                            return res.status(400).send({
                                errorMessage: "Please check your inputs and try again!"
                            })
                        }
                        let uuidValue = uuid();
                        let insertIntoTransactions = `insert into transaction values('${username}','${uuidValue}','${
                            req.body.description
                            }','${req.body.merchant}','${req.body.amount}','${
                            req.body.date
                            }','${req.body.category}')`;

                        db.query(insertIntoTransactions, (err, result) => {
                            if (err) throw err;
                            returnObj = {
                                id: `${uuidValue}`,
                                description: `${req.body.description}`,
                                merchant: `${req.body.merchant}`,
                                amount: `${req.body.amount}`,
                                date: `${req.body.date}`,
                                category: `${req.body.category}`
                            }
                            console.log("req.duler", req.file)
                            if (req.file) {
                                let attachUUID = uuid();
                                returnObj = {
                                    id: `${uuidValue}`,
                                    description: `${req.body.description}`,
                                    merchant: `${req.body.merchant}`,
                                    amount: `${req.body.amount}`,
                                    date: `${req.body.date}`,
                                    category: `${req.body.category}`,
                                    attachments: [{
                                        id: `${attachUUID}`,
                                        url: `${req.file.location}`
                                    }]
                                }
                                let insertIntoAttc = `insert into attachmentlog values ('${attachUUID}','${uuidValue}','${req.file.location}')`;
                                db.query(insertIntoAttc, (err, result) => {
                                    if (err) throw err;

                                })
                            }
                            res.status(200).send(returnObj)

                        })
                    })
                } else { //normal profile
                    console.log("Inside normal profile")
                    aws.uploadOne(req, res, function (err) {
                        if (err) {
                            return res.status(400).send({
                                errorMessage: "Please check your inputs and try again!"
                            })
                        }
                        let uuidValue = uuid();
                        let insertIntoTransactions = `insert into transaction values('${username}','${uuidValue}','${
                            req.body.description
                            }','${req.body.merchant}','${req.body.amount}','${
                            req.body.date
                            }','${req.body.category}')`;

                        db.query(insertIntoTransactions, (err, result) => {
                            if (err) throw err;
                            returnObj = {
                                id: `${uuidValue}`,
                                description: `${req.body.description}`,
                                merchant: `${req.body.merchant}`,
                                amount: `${req.body.amount}`,
                                date: `${req.body.date}`,
                                category: `${req.body.category}`
                            }
                            if (req.file) {
                                let attachUUID = uuid();

                                returnObj = {
                                    id: `${uuidValue}`,
                                    description: `${req.body.description}`,
                                    merchant: `${req.body.merchant}`,
                                    amount: `${req.body.amount}`,
                                    date: `${req.body.date}`,
                                    category: `${req.body.category}`,
                                    attachments: [{
                                        id: `${attachUUID}`,
                                        url: `${req.file.path}`
                                    }]
                                }
                                let insertIntoAttc = `insert into attachmentlog values ('${attachUUID}','${uuidValue}','${req.file.path}')`;
                                db.query(insertIntoAttc, (err, result) => {})
                            }
                            res.status(200).send(returnObj)

                        })
                    })
                }
            } else {
                res.send(
                    JSON.stringify({
                        errorMessage: "Please check your credentials and try again"
                    })
                );
            }
        });


    }
});

router.get("/", (req, res) => {
    if (req.headers.authorization) {
        logger.info("GET /transaction endpoint has been hit")
        sdc.increment('/transaction')

        let credentials = new Buffer(
            req.headers.authorization.split(" ")[1],
            "base64"
        ).toString();
        let username = credentials.split(":")[0];
        let password = credentials.split(":")[1];
        userValidator.userValidation(username, password, function (err, isValid) {
            if (isValid) {
                const getTransactions = `select * from transaction where username ='${username}'`;
                db.query(getTransactions, (err, results) => {
                    if (!results) res.send({"info":"No transactions for this user"});
                    if(results.length==0)  res.send({"info":"No transactions for this user"});
                    console.log("Transaction results are ", results.length)
                    var finalArray = [];
                    let trackIndex = 0;
                    results.forEach((result) => {
                        var id = result.id;
                        var description = result.description;
                        var merchant = result.merchant;
                        var amount = result.amount;
                        var date = result.date;
                        var category = result.category;

                        let checkingForAttachments = `select * from attachmentlog where transactionID= '${id}'`;

                        db.query(checkingForAttachments, (checkErr, checkResult) => {
                            if (checkErr) throw checkErr;
                            if (checkResult.length) {
                                var attachments = [];
                                for (let j = 0; j < checkResult.length; j++) {
                                    var attachment = {
                                        id: `${checkResult[j].id}`,
                                        url: `${checkResult[j].path}`
                                    }
                                    attachments.push(attachment);
                                }
                                finalArray.push({
                                    id: `${id}`,
                                    description: `${description}`,
                                    merchant: `${merchant}`,
                                    amount: `${amount}`,
                                    date: `${date}`,
                                    category: `${category}`,
                                    attachments
                                });
                            } else {
                                finalArray.push({
                                    id: `${id}`,
                                    description: `${description}`,
                                    merchant: `${merchant}`,
                                    amount: `${amount}`,
                                    date: `${date}`,
                                    category: `${category}`,
                                });
                            }
                            trackIndex += 1;
                            console.log(trackIndex)

                            if (trackIndex === results.length) {
                                res.json(finalArray)
                            }
                        });
                    })
                });
            } else {
                res.send(
                    JSON.stringify({
                        errorMessage: "Please check your credentials and try again"
                    })
                );
            }
        });
    } else {
        res.send(
            JSON.stringify({
                errorMessage: "Please login using username and password"
            })
        );
    }
});



module.exports = router;
