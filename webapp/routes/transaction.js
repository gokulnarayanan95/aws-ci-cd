const express = require("express");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
var router = express.Router();
var db = require('../db');
const userValidator = require("../validators/user-validator");
const aws = require("../aws");
const transactionWithoutParams = require("../routes/transaction-without-params");
var fs = require("fs");

var logger = require("../config/winston").logger
var SDC = require('statsd-client')
var sdc = new SDC({host: 'localhost', port: 8125, debug: true});


router.delete('/:transactionId', (req, res) => {
    logger.info("delete /transaction/transactionID endpoint has been hit")
    sdc.increment('/transaction/transactionID')

    if (req.headers.authorization) {
        let credentials = new Buffer(req.headers.authorization.split(" ")[1], 'base64').toString()
        let username = credentials.split(":")[0]
        let password = credentials.split(":")[1]
        userValidator.userValidation(username, password, function (err, isValid) {
            if (isValid) {
        const checkIfIdExists = `select * from transaction where username = '${username}' and id = '${req.params.transactionId}'`;
        console.log(checkIfIdExists);
        db.query(checkIfIdExists, (erri, transResult) => {
            if (erri) {
                throw erri;
            } else {
                if (transResult.length === 0) {
                    res.sendStatus(400)
                } else {
                    const sql = `select * from auth where username = '${username}'`;
                    db.query(sql, (err, result) => {
                        if (err) throw err;
                        console.log("Length" + result.length);
                        if (result.length) {
                            if (!process.env.profile) { //normal profile
                                let deleteFromAttachment = `select * from attachmentlog where transactionID = '${req.params.transactionId}'`;
                                db.query(deleteFromAttachment, (err, result) => {
                                    if (result.length) {
                                        let paths = result.map((item) => item.path)
                                        let files = paths.map((item) => item.split("uploads/")[1])
                                        files.forEach((file) => {
                                            fs.unlink('uploads/' + file, (err) => {
                                                console.log("File has been deleted")
                                            })
                                        })
                                    }
                                })
                            } else if (process.env.profile === 'dev') {
                                let query = `select * from attachmentlog where transactionID = '${req.params.transactionId}'`;
                                db.query(query, (err, result) => {
                                    console.log("Result", result)
                                    let paths = result.map((item) => item.path)
                                    let imageNames = paths.map((path) => path.split("me.csye6225.com/")[1])
                                    imageNames.forEach((imageName) => {
                                        aws.deleteSpecificObjects(imageName)
                                    })
                                })
                            }

                            let deleteTransaction = `delete from transaction where id ='${req.params.transactionId}'`;
                            db.query(deleteTransaction, (err, result) => {
                                console.log(deleteTransaction);
                                if (err) throw err;
                                let deleteFromAttachment = `delete from attachmentlog where transactionID = '${req.params.transactionId}'`;
                                db.query(deleteFromAttachment, (err, result) => {})
                                res.sendStatus(204);
                            })
                        }
                    });
                }
            }
        })
    



    } else {
        res.send(JSON.stringify({
            errorMessage: "Please login using username and password"
        }))
    }
});
    }
});

router.put("/:transactionId", (req, res) => {
    if (req.headers.authorization) {
        logger.info("PUT /transaction/transactionID endpoint has been hit")
        sdc.increment('/transaction/transactionID')
            let credentials = new Buffer(
            req.headers.authorization.split(" ")[1],
            "base64"
        ).toString();
        let username = credentials.split(":")[0];
        let password = credentials.split(":")[1];
        userValidator.userValidation(username, password, function (err, isValid) {
            if (isValid) {
                console.log("SHriya",req.body);
                const checkIfIdExists = `select * from transaction where username = '${username}' and id = '${
                                req.params.transactionId
                                }'`;
                db.query(checkIfIdExists, (erri, transResult) => {
                    if (erri) {
                        throw erri;
                    } else {
                       console.log(checkIfIdExists)
                        console.log("aa", transResult);
                        if (transResult.length === 0) {
                            res.sendStatus(400);
                        } else {
                            const sql = `select * from auth where username = '${username}'`;
                            db.query(sql, (err, result) => {
                                if (err) throw err;
                                console.log("Length" + result.length);
                                if (result.length) {
                                    let updateTransaction = `update transaction set description = '${
                                                    req.body.description
                                                    }' , merchant = '${req.body.merchant}',amount = '${
                                                    req.body.amount
                                                    }', date = '${req.body.date}', category = '${
                                                    req.body.category
                                                    }' where id = '${req.params.transactionId}' `;
                                    db.query(updateTransaction, (err, result) => {
                                        console.log(updateTransaction);
                                        if (err) throw err;
                                        let fetchAttachments = `select * from attachmentlog where transactionID = '${req.params.transactionId}'`;
                                        db.query(fetchAttachments, (err, result) => {
                                            if (result.length) {
                                                console.log(result)
                                                return res.status(201).send({
                                                    id: `${req.params.transactionId}`,
                                                    description: `${req.body.description}`,
                                                    merchant: `${req.body.merchant}`,
                                                    amount: `${req.body.amount}`,
                                                    date: `${req.body.date}`,
                                                    category: `${req.body.category}`,
                                                    attachments: result
                                                });
                                            }
                                            res.status(201).send({
                                                id: `${req.params.transactionId}`,
                                                description: `${req.body.description}`,
                                                merchant: `${req.body.merchant}`,
                                                amount: `${req.body.amount}`,
                                                date: `${req.body.date}`,
                                                category: `${req.body.category}`,
                                            });
                                        })
                                    });
                                }
                            });
                        }
                    }
                });
            } else {
                res.sendStatus(401);
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


router.post("/:transactionId/attachments", (req, res) => {
    if (req.headers.authorization) {
        console.log("Inside auth inside post attachments");
        logger.info("POST /transaction/attachments endpoint has been hit")
        sdc.increment('/transaction/transactionID/attachments')
        let credentials = new Buffer(
            req.headers.authorization.split(" ")[1],
            "base64"
        ).toString();
        let username = credentials.split(":")[0];
        let password = credentials.split(":")[1];
        let hashedPassInDB;
        userValidator.userValidation(username, password, function (err, isValid) {
            if (isValid) {
                        const sql = `select * from auth where username = '${username}'`;
                        db.query(sql, (err, result) => {
                            if (err) throw err;
                            console.log(result.length);
                            if (result.length) {
                                const doesTransIdExist = `select * from transaction where id = '${
                                    req.params.transactionId
                                    }' and username = '${username}'`;
                                db.query(doesTransIdExist, (Error, resu) => {
                                    if (Error) throw Error;
                                    // console.log("Resu", resu)
                                    if (resu.length) {
                                        if (process.env.profile === 'dev') {
                                            console.log("Inside dev")
                                            aws.uploadS3(req, res, function (err) {
                                                if (err) throw err;
                                                console.log("Res", res)
                                                let attachUUID = uuid();
                                                let insertIntoAttachmentLogs = `insert into attachmentlog values('${attachUUID}','${req.params.transactionId}','${req.file.location}')`
                                                db.query(insertIntoAttachmentLogs, (Err, result) => {
                                                    if (Err) throw Err;
                                                    console.log("Req.file", req.file)
                                                    res.status(200).send(JSON.stringify([{
                                                        id: `${attachUUID}`,
                                                        url: `${req.file.location}`
                                                    }]))
                                                })
                                            })
                                        } else { //normal profile
                                            aws.upload(req, res, function (err) {
                                                //console.log("req.filerino", req.file.path)
                                                if (err) {
                                                    console.log(err);
                                                    return res.end("Sorry you can only upload images of a certain format");
                                                }
                                                if (req.file === undefined) {
                                                    return res.sendStatus(401);
                                                }
                                                let attachUUID = uuid();
                                                let insertIntoAttachmentLogs = `insert into attachmentlog values('${attachUUID}','${req.params.transactionId}','${req.file.path}')`
                                                db.query(insertIntoAttachmentLogs, (Err, result) => {
                                                    if (Err) throw Err;
                                                    console.log("Req.file", req.file)
                                                    res.status(200).send(JSON.stringify([{
                                                        id: `${attachUUID}`,
                                                        url: `${req.file.path}`
                                                    }]))
                                                })
                                            });
                                        }
                                    } else {
                                        res.sendStatus(401);
                                    }
                                });
                            }
                        });
                    } else {
                        res.sendStatus(401);
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

router.delete("/:transactionId/attachments/:attachmentId", (req, res) => {
    if (req.headers.authorization) {
        logger.info("DELETE /transaction/transactionID/attachments/attachmentID endpoint has been hit")
        sdc.increment('/transaction/transactionID/attachments/attachmentID')
        console.log("Inside auth inside delete attachments");
        let credentials = new Buffer(
            req.headers.authorization.split(" ")[1],
            "base64"
        ).toString();
        let username = credentials.split(":")[0];
        let password = credentials.split(":")[1];
        let hashedPassInDB;
        let filePath;
        userValidator.userValidation(username, password, function (err, isValid) {
            if (isValid) {
            const sql = `select * from auth where username = '${username}'`;
            db.query(sql, (err, result) => {
                if (err) throw err;
                console.log(result.length);
                if (result.length) {
                    const doesTransIdExist = `select * from transaction where id = '${
                                    req.params.transactionId
                                    }' and username = '${username}'`;
                    db.query(doesTransIdExist, (Error, resu) => {
                        if (Error) throw Error;
                        if (resu.length) {
                            let doesAttachmentExist = `select * from attachmentlog where id = '${req.params.attachmentId}'`;
                            db.query(doesAttachmentExist, (error, result) => {
                                if (result.length) {
                                    if (process.env.profile === 'dev') {
                                        console.log("Inside delete dev")
                                        console.log("The result is ", result)
                                        let path = result[0].path.split("me.csye6225.com/");
                                        let object = path[1];
                                        aws.deleteObjectsFromS3(object, req, res, req.params.attachmentId, "Delete")
                                    } else {
                                        let doesAttachmentIdExist = `select * from attachmentlog where id = '${req.params.attachmentId}'`;
                                        db.query(doesAttachmentIdExist, (error, result) => {
                                            console.log('req.file', req.file)
                                            console.log("The result is ", result)

                                            if (result.length) {
                                                filePath = result[0].path;
                                                console.log("The file path", filePath)
                                                let deleteAttachment = `delete from attachmentlog where id = '${req.params.attachmentId}'`;
                                                db.query(deleteAttachment, (err, result) => {
                                                    if (err) throw err;
                                                    fs.unlink(filePath, (err) => {
                                                        console.log(err)
                                                    });
                                                    res.sendStatus(204);
                                                })
                                            } else {
                                                res.sendStatus(401);
                                            }
                                        })

                                    }

                                } else {
                                    res.sendStatus(401);
                                }
                            })

                        } else {
                            res.sendStatus(401);
                        }
                    });
                }
            });
        } else {
            res.sendStatus(401);
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


router.get("/:transactionId/attachments", (req, res) => {
    if (req.headers.authorization) {
        logger.info("GET /transaction/transactionID/attachments endpoint has been hit")
        sdc.increment('/transaction/transactionID/attachments')
        console.log("Inside auth inside get attachments");
        let credentials = new Buffer(
            req.headers.authorization.split(" ")[1],
            "base64"
        ).toString();
        let username = credentials.split(":")[0];
        let password = credentials.split(":")[1];
        let hashedPassInDB;
        userValidator.userValidation(username, password, function (err, isValid) {
            if (isValid) {
                const sql = `select * from auth where username = '${username}'`;
                db.query(sql, (err, result) => {
                    if (err) throw err;
                    console.log(result.length);
                    if (result.length) {
                        const doesTransIdExist = `select * from transaction where id = '${
                                    req.params.transactionId
                                    }' and username = '${username}'`;
                        db.query(doesTransIdExist, (Error, resu) => {
                            if (Error) throw Error;
                            if (resu.length) {
                                let retrieveAttachments = `select * from attachmentlog where transactionID = '${req.params.transactionId}' `
                                db.query(retrieveAttachments, (err, result) => {
                                    console.log("Get attachments results are", result)
                                    if (result.length === 0) {
                                        return res.send(JSON.stringify("Sorry , Your transaction has no attachments"))
                                    }
                                    res.status(200).json(result)
                                })
                            } else {
                                res.sendStatus(401);
                            }
                        });
                    }
                });
            } else {
                res.sendStatus(401);
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

router.put("/:transactionId/attachments/:attachmentId", (req, res) => {
    if (req.headers.authorization) {
        logger.info("PUT /transaction/transactionID/attachments/attachmentID endpoint has been hit")
        sdc.increment('/transaction/transactionID/attachments/attachmentID')
        let credentials = new Buffer(
            req.headers.authorization.split(" ")[1],
            "base64"
        ).toString();
        let username = credentials.split(":")[0];
        let password = credentials.split(":")[1];
        let filePath;
        userValidator.userValidation(username, password, function (err, isValid) {
            if (isValid) {
                const sql = `select * from auth where username = '${username}'`;
                db.query(sql, (err, result) => {
                    if (err) throw err;
                    console.log(result.length);
                    if (result.length) {
                        const doesTransIdExist = `select * from transaction where id = '${
                                    req.params.transactionId
                                    }' and username = '${username}'`;
                        db.query(doesTransIdExist, (Error, resu) => {
                            if (Error) throw Error;
                            if (resu.length) {
                                let updateAttachments = `select * from attachmentlog where transactionID = '${req.params.transactionId}' and id = '${req.params.attachmentId}'`;
                                db.query(updateAttachments, (err, result) => {
                                    console.log("Get attachments results are", result)

                                    if (result.length === 0) {
                                        return res.sendStatus(401);
                                    } else {
                                        if (process.env.profile === 'dev') {
                                            console.log("Inside update attachment")
                                            let path = result[0].path.split("me.csye6225.com/");
                                            console.log("Path" + path);
                                            let object = path[1];
                                            aws.deleteObjectsFromS3(object, req, res, req.params.attachmentId, "Update", req.params.transactionId)
                                        } else {
                                            filePath = result[0].path;
                                            aws.upload(req, res, function (err) {
                                                if (err) {
                                                    console.log(err);
                                                    return res.end("Sorry , You can only upload in PNG, JPG and JPEG Formats");
                                                }
                                                fs.unlink(filePath, (err) => {
                                                    if (err) throw err;
                                                    console.log("req.filelalal", req.file)
                                                    let replacePath = `update attachmentlog set path = 'uploads/${req.file.originalname}' where id = '${req.params.attachmentId}'`
                                                    db.query(replacePath, (err, result) => {
                                                        if (err) throw err;
                                                        res.sendStatus(200);
                                                    })
                                                })

                                            });
                                        }
                                    }
                                })
                            } else {
                                res.sendStatus(401);
                            }
                        });

                    }
                });
            } else {
                res.sendStatus(401);
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

router.use("/",transactionWithoutParams);


module.exports = router;