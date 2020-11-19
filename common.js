

module.exports = CloseDbConnection = (dbobj) => {
    try {
        dbobj.end(function(err) {
            if (err) {
              return console.log('error:' + err.message);
            }
            console.log('Close the database connection.');
          });
    } catch (error) {
      return console.log('error:' + error);
    }
  };