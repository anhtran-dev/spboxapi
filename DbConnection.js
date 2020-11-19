
var mysql      = require('mysql');



module.exports = async function ConnnectDb(callback) {
  var connection = mysql.createConnection({
    connectionLimit : 200,
          host     : '127.0.0.1',
    user     : 'root',
    password : 'test123',
    database : 'sportsbox', 
    port     : '3306'

        
  });

  connection.connect(function(err) {
    if (err) {
      console.error("error connecting: " + err.stack);
      return;
    }

    console.log("connected as id " + connection.threadId);
    return callback(null, connection);
  });
};

