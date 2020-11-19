var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const bearerToken = require('express-bearer-token');
module.exports = function (req, res, next) {
  bearerToken();
  const  header = req.headers['Authorization'];
  console.log('header:' + header)
  if (!header) {
    res.status(403).send({ auth: false, message: 'No token provided.' });
  }

  const bearer = header.split(' ');
  const tokenSplitted = bearer[1];

  jwt.verify(tokenSplitted, 'SP@Api', (err, result) => {

    if (err) {
      res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
    }

    req.userId = result.id;
  });

  next();
};
