var mysql = require('mysql');
require("dotenv").config();
const multer = require("multer");
var multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const path = require("path");
var db = require('./db');
const deleteMulter = multer();
const getFormData = multer({});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const uploadS3=   multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.bucket,
        key: function (req, file, cb) {
            cb(null, file.originalname); //use Date.now() for unique file keys
        }
    }),
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        console.log("Ext is", ext)
        console.log(ext !== ".png")
        if (ext === ".jpg" || ext === ".png" || ext === ".jpeg") {
            return callback(null, true);
        }
        callback(new Error("Only images are allowed"));
    }
}).single('upl') ;

module.exports ={
 uploadS3One : multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.bucket,
        key: function (req, file, cb) {
            var uniqueFileName = file.originalname+"----"+new Date();
            console.log(req.body);
            if (req.body.merchant && req.body.amount && req.body.date && req.body.category && req.body.description) {
                return cb(null, uniqueFileName); //use Date.now() for unique file keys
            }
            cb(new Error("400"))
        }
    }),
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        console.log("Ext is", ext)
        if (ext === ".jpg" || ext === ".png" || ext === ".jpeg") {
            return callback(null, true);
        }
        callback(new Error("Only images are allowed"));
    }
}).single('upl'),

uploadS3 : multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.bucket,
        key: function (req, file, cb) {
            var uniqueFileName = file.originalname+"---"+new Date();
            cb(null, uniqueFileName); //use Date.now() for unique file keys
        }
    }),
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        console.log("Ext is", ext)
        console.log(ext !== ".png")
        if (ext === ".jpg" || ext === ".png" || ext === ".jpeg") {
            return callback(null, true);
        }
        callback(new Error("Only images are allowed"));
    }
}).single('upl'),
 
upload : multer({
    storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        console.log("Ext is", ext)
        if (ext === ".jpg" || ext === ".png" || ext === ".jpeg") {
            return callback(null, true);
        }
        callback(new Error("Only images are allowed"));
    }
}).single('upl'),

 uploadOne : multer({
    storage,
    fileFilter: function (req, file, callback) {
        if (req.body.merchant && req.body.amount && req.body.date && req.body.category && req.body.description && file) {
            console.log("Plaa")
            var ext = path.extname(file.originalname);
            console.log(ext)
            if (ext === ".jpg" || ext === ".png" || ext === ".jpeg") {
                return callback(null, file.originalname);
            }
            callback(new Error("Check your form-body"))
        } else if (req.body.merchant && req.body.amount && req.body.date && req.body.category && req.body.description) {
            return callback(null, file.originalname);
        } else {
            callback(new Error("Check your form body"))
        }
    }
}).single('upl'),
deleteObjectsFromS3: function(key, req, res, attachmentID, method, transactionId) {
    console.log("keyyy " + key);
    var params = {
        Bucket: process.env.bucket,
        Key: key
    };

    s3.deleteObject(params, function (err, data) {
        if (err) console.log(err, err.stack); // error
        else {
            let deleteObjectFromTable = `delete from attachmentlog where id = '${attachmentID}'`;
            db.query(deleteObjectFromTable, (err, result) => {
                if (method === "Delete") {
                    res.sendStatus(204);
                } else {
                    uploadS3(req, res, function (err) {
                        if (err) {
                            res.send("Sorry , You can only upload images in specific formats")
                        }
                        let insertIntoAttachmentLogs = `insert into attachmentlog values('${attachmentID}','${req.params.transactionId}','${req.file.location}')`
                        db.query(insertIntoAttachmentLogs, (Err, result) => {
                            if (Err) throw Err;
                            console.log("Req.file", req.file)
                            res.sendStatus(200)
                        })

                    })

                }

            })

        }
    });
},
 deleteSpecificObjects: function(key) {
    var params = {
        Bucket: process.env.bucket,
        Key: key
    };

    s3.deleteObject(params, (err, data) => {
        console.log("Item deleted from s3",params)
    })
}

}
