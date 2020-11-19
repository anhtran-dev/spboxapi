var express = require('express');
var router = express.Router()
var bodyParser = require('body-parser')
var randtoken = require('rand-token')
var jwt = require('jsonwebtoken');
var bcrypt = require('react-native-bcrypt');
//import bcrypt from "react-native-bcrypt";
var connnectDb = require('./DbConnection');
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

var PushNotifications = require('./PushNotifications');

const CloseDbConnection =require('./common');

var db;

function closedbconnection(dbobj)
{
  dbobj.end(function(err) {
    if (err) {
      return console.log('error:' + err.message);
    }
    console.log('Close the database connection.');
  });
}

router.post('/Login', function (req, res, next) {

  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Unabe to Connect to Database' });
    try {
    db = response;

    if (req.body.email && req.body.email != "" && req.body.password && req.body.password != "") {
      db.query('SELECT * from users  where Email= ?', [req.body.email], function (error, results, fields) {

        if (error) 
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }
        if (results)

          if (results.length > 0 && results[0]) {
            passwordComparison(results[0].Password, req.body.password, function (passwordIsValid, err) {

              if (err) 
              {
                CloseDbConnection(db);
              return res.status(500).send({ message: 'Error in Password Comparison.' });
              }
              if (!passwordIsValid) 
              {
                CloseDbConnection(db);
              return res.status(401).send({ auth: false, token: null, message: "Password is InCorrect!" });
              }
              var token = jwt.sign({ id: results[0].UserId }, "SP@Api", {
                expiresIn: 60 * 300
              });

              var refreshToken = randtoken.uid(256)
              refreshTokens[refreshToken] = results[0].UserId
              CloseDbConnection(db);
            return  res.status(200).send({ access_token: token, refresh_token: refreshToken, id: results[0].UserId, Data: results[0], expires_in: "3 minutes" });
              res.end();
            });
          } else {
            CloseDbConnection(db);
         return   res.status(200).send({ message: "Username is InCorrect!" });
            res.end();
          }

      });
    }
    else
    {
      CloseDbConnection(db);
      return res.status(406).send({ message: "Please enter Email and Password!" });
    }
  } catch (err) {
    CloseDbConnection(db);
    console.log('exception error: ',err);
    return res.status(500).send({ message: "Error Occured! "+err });
  }
  });
});


const passwordComparison = function (dbpassword, paramPassword, callback) {
  var res = bcrypt.compareSync(paramPassword, dbpassword);
  callback(res);
}


const refreshTokens = {}
router.post('/refreshToken', function (req, res, next) {
  try
  {
  var username = req.body.id
  var refreshToken = req.body.refresh_token

  if ((refreshToken in refreshTokens) && (refreshTokens[refreshToken] == username)) {
    var user = {
      '_id': username
    }
    var token = jwt.sign({ id: user._id }, 'SP@Api', { expiresIn: 60 * 300 });

    var refreshToken = randtoken.uid(256)
    refreshTokens[refreshToken] = user._id
    res.status(200).json({ access_token: token, refresh_token: refreshToken, id: user._id, expires_in: "3 minutes" })
  }
  else {

    res.sendStatus(401)
  }
}
catch(err)
{
  return res.status(500).send({ message: "Error Occured! "+err });
}
})


router.get('/GetRolesList', function (req, res, next) {
  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    try {
      db = response; var arr = [];

      db.query('SELECT * FROM roles;', function (error1, results, fields) {

        if (error1) 
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: 'Error on the server.' });
        }
        if (results)
        {
          CloseDbConnection(db);
       return   res.status(200).send(results);
        }
        else
        {
          CloseDbConnection(db);
       return   res.status(200).send('');
        }
      });
    }
      catch(err)
      {
        CloseDbConnection(db);
        console.log('exception error: ',err);
        return res.status(500).send({ message: "Error Occured! "+err });
      }
  });
});


router.post('/registerUser', function (req, res, next) {

  try {
    if (!req.body.FirstName || req.body.FirstName == "" || req.body.FirstName == '') {
      res.status(500).send({ message: 'FirstName is missing!' });
    } if (!req.body.LastName || req.body.LastName == "" || req.body.LastName == '') {
      res.status(500).send({ message: 'LastName is missing!' });
    } if (!req.body.Email || req.body.Email == "" || req.body.Email == '') {
      res.status(500).send({ message: 'Email is missing!' });
    } if (!req.body.Password || req.body.Password == "" || req.body.Password == '') {
      res.status(500).send({ message: 'Password is missing!' });
    } if (!req.body.UserRole || req.body.UserRole == "" || req.body.UserRole == '') {
      res.status(500).send({ message: 'UserRole is missing!' });
    }
    connnectDb(function (Error, response) {
      if (Error) {
        res.status(500).send('Unabe to Connect to Database!');
      }

      db = response;

      db.query('SELECT * FROM users Where Email="' + req.body.Email + '"', function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error Occured!' });
        }
        var FirstName = (req.body.FirstName ? req.body.FirstName : "");
        var LastName = (req.body.LastName ? req.body.LastName : "");
        var Email = (req.body.Email ? req.body.Email : "");
        var Password = (req.body.Password ? req.body.Password : "");
        var UserRole = (req.body.UserRole ? req.body.UserRole : "");
        Password = bcrypt.hashSync(Password);

        if (!results || results.length == 0) {

          var query = 'insert into users (FirstName,LastName,Email,Password,Role)  VALUES  ("' + FirstName + '","' + LastName + '","' + Email + '","' + Password + '","' + UserRole + '")';

          db.query(query, function (err, results) {


            if (err)
            {
              CloseDbConnection(db);
          return  res.status(500).send({ message: 'Error' });
            }
          });

          CloseDbConnection(db);
          return res.status(200).send({ message: 'Account Created Successfully!' });
        }
        CloseDbConnection(db);
        return res.status(200).send({ message: 'Email Already Exisit!' });
      });
    });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception error: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});


router.post('/SaveExpoToken', function (req, res, next) {

  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Unabe to Connect to Database' });
try
{
    db = response;

    if (req.body.UserID && req.body.UserID != "" && req.body.ExpoToken && req.body.ExpoToken != "") {
      db.query('SELECT * from users  where UserId= ?', [req.body.UserID], function (error, results, fields) {

        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }
        if (results)

          if (results.length > 0 && results[0]) {



            var query = "Update users   set ExpoToken='" + req.body.ExpoToken + "' Where UserId=" + req.body.UserID + "";
            db.query(query, function (err, results) {

              if (err)
              {
                CloseDbConnection(db);
                return res.status(500).send({ message: 'Error' });
              }
            });
            CloseDbConnection(db);
          return  res.status(200).send({ message: "Updated Successfully!" });

          } else {
            CloseDbConnection(db);
          return  res.status(200).send({ message: "User is  Not Found!" });
            res.end();
          }

      });
    }
    else
    {
      CloseDbConnection(db);
      return res.status(406).send({ message: "UserID or ExpoToken is missing!" });
    }
  }
  catch(err)
  {
    CloseDbConnection(db);
    console.log('exception error: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
  });
});




module.exports = router;