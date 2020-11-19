var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var connnectDb = require('./DbConnection');
var ResponeModel = require('./Models/ResponeModel');
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

const CloseDbConnection =require('./common');

var db;



router.get('/GetUsersList/:page', function (req, res, next) {

  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 1;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;
    try {
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM users', function (error, results, fields) {
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send('Error on the server.');
        }
        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
          db.query('SELECT * FROM users Order by UserId Desc LIMIT ' + limit, function (error1, results, fields) {
            if (error1) 
            {
              CloseDbConnection(db);
            return res.status(500).send('Error on the server.');
            }
            CloseDbConnection(db);
         return   res.status(200).send(new ResponeModel(numPages, page, results));
          });
        }
        else
        {
          CloseDbConnection(db);
        return  res.status(200).send('');
        }
      });
    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});


router.get('/GetUsersById/:userId', function (req, res, next) {
  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    try {
      var userId = parseInt(req.params.userId);
      db = response; var arr = [];
      db.query('SELECT * FROM users Where UserId=' + userId, function (error1, results, fields) {
        if (error1) 
        {
          CloseDbConnection(db);
        return res.status(500).send('Error on the server.');
        }
        if (results)
        {
          CloseDbConnection(db);
        return  res.status(200).send(results);
        }
        else
        {
          CloseDbConnection(db);
         return res.status(200).send('');
        }
      });
    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});


router.post('/SaveUser', function (req, res, next) {
  try {
    if (!req.body.Email || req.body.Email == "" || !req.body.FirstName || req.body.FirstName == "" || !req.body.LastName || req.body.LastName == ""
      || !req.body.Password || req.body.Password == "") {
    return  res.status(500).send({ message: 'Required Fields are missing' });
    }
    connnectDb(function (Error, response) {
      if (Error) {
        res.status(500).send('Unabe to Connect to Database');
      }
      db = response;
      db.query("SELECT * FROM users Where Email='" + req.body.Email + "'", function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }
        if (!results || results.length == 0) {
       //   var query = "insert into users (FirstName,LastName,Email,Password) Values ('" + req.body.FirstName + "','" + req.body.LastName + "','" + req.body.Email + "','" + req.body.Password + "')";
      //    db.query(query, function (err, results) {
            var query = "insert into users (FirstName,LastName,Email,Password) Values (?,?,?,?)";
            db.query(query,[req.body.FirstName,req.body.LastName,req.body.Email,req.body.Password], function (err, results) {
            if (err)
            {
              CloseDbConnection(db);
          return  res.status(500).send({ message: 'Error' });
            }
          });
          CloseDbConnection(db);
          return res.status(200).send({ message: 'Success' });
        }
        CloseDbConnection(db);
        return res.status(200).send({ message: 'User Already Exisit' });
      });
    });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});

module.exports = router;