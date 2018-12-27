var db = require("../db");
const bcrypt = require("bcrypt");
module.exports = {
  userValidation: function ValidateUser(username, password, callback) {
    let hashedPassInDB;
    let getHashedPassword = `SELECT password from auth where username = '${username}'`;

    db.query(getHashedPassword, (err, result) => {
      if (err) throw err;
      if (result.length) {
        hashedPassInDB = result[0].password;
        bcrypt.compare(password, hashedPassInDB, (err, resu) => {
          if (resu) {
            callback(null, true);
          } else {
            callback(null);
          }
        });
      }
      else{
       callback(null)
      }
    });
  },
  userExists: function doesUserExist(username, callback){
    let query=`select * from auth where username= '${username}'`;
    db.query(query,(err,result)=>{
      if(err) throw err;
      if(result.length){
        callback(null,true);
      }
      else {
        callback(null);
      }
    }

    );
  }
};
