var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var connnectDb = require('./DbConnection');
var ResponeModel = require('./Models/ResponeModel');
var ManageTeamModel = require('./Models/ManageTeamsModel');
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

//var SendPushNotification =require('./PushNotifications');
//var SendPushNotificationOnTeamJoining =require('./PushNotifications');
const CloseDbConnection =require('./common');
var fetch = require('node-fetch');

async function SendPushNotification(UserID,NotificationText) {


  try {

      console.log('its called in push noptification');

      connnectDb(function (error, response) {
            if (error) return "Unabe to Connect to Database";
            try {
              var UID = 0;
              if(!isNaN(UserID))
              {
                UID = parseInt(UserID);
              }
              db = response; var messages = [];
              db.query('SELECT ExpoToken from users  where UserId=' + UID, function (error1, results, fields) {
                if (error1) return  "Failed";   //res.status(500).send({message:'Error on the server.'});
                if (results && results.length>0 && results[0])
                {
                messages.push({
                    to: results[0].ExpoToken,
                    sound: 'default',
                    body: NotificationText,
                  });
                fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(messages),
                  });
                  console.log('its sent push noptification');
               return "Sent";
                }
                else
                {
                  console.log('its failed push noptification');
                return "Failed";
                }
              });
            } catch (err) {
              console.log('err ',err);
            }
           
          });
          return "Failed";
    } catch (error) {
      console.log('error ',error);
      return error;
    }


};
async function SendPushNotificationOnTeamJoining(TeamID,NotificationText) {

  try {
  

    connnectDb(function (Error, response) {
        if (Error) return "'Unabe to Connect to Database'";
        try {
          var TeamId = 0;
          if(!isNaN(TeamID))
          {
            TeamId = parseInt(TeamID);
          }
          db = response; var messages = [];
          db.query('SELECT * from teams  where TeamId=' + TeamId, function (error1, results, fields) {
            if (error1) return  "Failed";
            if (results && results.length>0 && results[0])
            {
              let res="Failed";
                res=  SendPushNotification_WithInClass(results[0].CreatedBy,NotificationText);
           return res;
            }
            else
            {
            return "'Failed'";
            }
          });
        } catch (err) {
        }
      });
      return "'Failed'";
}catch (error) {
  return error;
}


};
const SendPushNotification_WithInClass = (UserID,NotificationText) => {
  try {


    connnectDb(function (Error, response) {
          if (Error) return "'Unabe to Connect to Database'";
          try {
            var UID = 0;
            if(!isNaN(UserID))
            {
              UID = parseInt(UserID);
            }
            db = response; var messages = [];
            db.query('SELECT ExpoToken from users  where UserId=' + UID, function (error1, results, fields) {
              if (error1) return  "Failed";    //res.status(500).send({message:'Error on the server.'});
              if (results && results.length>0 && results[0])
              {
              messages.push({
                  to: results[0].ExpoToken,
                  sound: 'default',
                  body: NotificationText,
                });
              fetch('https://exp.host/--/api/v2/push/send', {
                  method: 'POST',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(messages),
                });
             return "'Sent'";
              }
              else
              {
              return "'Failed'";
              }
            });
          } catch (err) {
          }
        });
        return "'Failed'";
  } catch (error) {
    return error;
  }
};
var db;

router.post('/GetTeamsList', function (req, res, next) {

  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.body.npp, 10) || 10;
    var page = parseInt(req.body.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {

      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM teams', function (error, results, fields) {
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }
        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);

          db.query('SELECT  tm.*,sp.SportId as SportId , sp.Name as Sports,pl.PlayLevelId as PlayLevelId  ,pl.Name as PlayLevel FROM teams tm left join sports as sp on tm.Sports=sp.SportId left join playlevels as pl on tm.PlayLevel= pl.PlayLevelId where tm.IsDeleted=0 Order by TeamId Desc LIMIT ' + limit, function (error1, results, fields) {
            if (error1) 
            {
              CloseDbConnection(db);
            return res.status(500).send({ message: "Error on the server." });
            }
            CloseDbConnection(db);
           return res.status(200).send(new ResponeModel(numPages, page, results));
          });
        }
        else {
          CloseDbConnection(db);
       return   res.status(200).send({ message: "" });
        }
      });

    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});

router.post('/GetJoinedTeamsList', function (req, res, next) {
  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      var userId = 0;
      if (req.body.UserID) {
        userId = parseInt(req.body.UserID);
      }
      let IsApproved = 'Accepted';
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM usersjoinedteams where IsApproved="' + IsApproved + '" AND UserId=' + userId, function (error, results, fields) {

   
        if (error) 
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }


        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);

          db.query('SELECT tm.*,sp.SportId as SportId , sp.Name as Sports,pl.PlayLevelId as PlayLevelId  ,pl.Name as PlayLevel FROM usersjoinedteams ujt left join teams tm on tm.TeamId=ujt.TeamId left join sports as sp on tm.Sports=sp.SportId left join playlevels as pl on tm.PlayLevel= pl.PlayLevelId where IsApproved="' + IsApproved + '" AND UserId="' + userId + '" Order by TeamId Desc ', function (error1, results, fields) {
         
            if (error1) 
            {
              CloseDbConnection(db);
            return res.status(500).send({ message: "Error on the server." });
            }
            CloseDbConnection(db);
          return  res.status(200).send(new ResponeModel(numPages, page, results));
          });
        }
        else {
          CloseDbConnection(db);
         return res.status(200).send({ message: "No Data Found" });
 
        }
      });


    } catch (err) {
      CloseDbConnection(db);
      console.log('exceptin: ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});


router.post('/SearchJoinedTeamsList', function (req, res, next) {

  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      let userId = 0;
      let SearchText = '';
      if (req.body.UserID) {
        userId = parseInt(req.body.UserID);
      }
      if (req.body.TeamName) {
        SearchText = req.body.TeamName;
       } 

      let IsApproved = 'Accepted';
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM usersjoinedteams where IsApproved="' + IsApproved + '" AND UserId=' + userId, function (error, results, fields) {

   
        if (error) 
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }


        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);

          db.query('SELECT tm.*,sp.SportId as SportId , sp.Name as Sports,pl.PlayLevelId as PlayLevelId  ,pl.Name as PlayLevel FROM usersjoinedteams ujt left join teams tm on tm.TeamId=ujt.TeamId left join sports as sp on tm.Sports=sp.SportId left join playlevels as pl on tm.PlayLevel= pl.PlayLevelId where IsApproved="' + IsApproved + '" AND UserId="' + userId + '" and tm.TeamName LIKE "%'+SearchText+'%" Order by TeamId Desc ', function (error1, results, fields) {
         
            if (error1) 
            {
              CloseDbConnection(db);
            return res.status(500).send({ message: "Error on the server." });
            }
            CloseDbConnection(db);
          return  res.status(200).send(new ResponeModel(numPages, page, results));
          });
        }
        else {
          CloseDbConnection(db);
          return  res.status(200).send(new ResponeModel(numPages, page, results=null));
 
        }
      });


    } catch (err) {
      CloseDbConnection(db);
      console.log('exceptin: ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});

router.post('/SearchRequestedTeamsList', function (req, res, next) {
  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      var userId = 0;
      let SearchText = '';
      if (req.body.UserID) {
        userId = parseInt(req.body.UserID);
      }
      if (req.body.TeamName) {
        SearchText = req.body.TeamName;
       }
      let IsApproved = 'Pending';
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM usersjoinedteams where IsApproved="' + IsApproved + '" AND UserId=' + userId, function (error, results, fields) {

        if (error) 
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }


        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);

          db.query('SELECT tm.*,sp.SportId as SportId , sp.Name as Sports,pl.PlayLevelId as PlayLevelId  ,pl.Name as PlayLevel FROM usersjoinedteams ujt left join teams tm on tm.TeamId=ujt.TeamId left join sports as sp on tm.Sports=sp.SportId left join playlevels as pl on tm.PlayLevel= pl.PlayLevelId where IsApproved="' + IsApproved + '" AND UserId="' + userId + '" and tm.TeamName LIKE "%'+SearchText+'%" Order by TeamId Desc ', function (error1, results, fields) {
     
            if (error1)
            {
              CloseDbConnection(db);
            return res.status(500).send({ message: "Error on the server." });
            }
            CloseDbConnection(db);
           return res.status(200).send(new ResponeModel(numPages, page, results));
          });
        }
        else {
          CloseDbConnection(db);
          return res.status(200).send(new ResponeModel(numPages, page, results=null));

        }
      });


    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});

router.post('/GetRequestedTeamsList', function (req, res, next) {
  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      var userId = 0;
      if (req.body.UserID) {
        userId = parseInt(req.body.UserID);
      }
      let IsApproved = 'Pending';
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM usersjoinedteams where IsApproved="' + IsApproved + '" AND UserId=' + userId, function (error, results, fields) {

        if (error) 
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }


        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);

          db.query('SELECT tm.*,sp.SportId as SportId , sp.Name as Sports,pl.PlayLevelId as PlayLevelId  ,pl.Name as PlayLevel FROM usersjoinedteams ujt left join teams tm on tm.TeamId=ujt.TeamId left join sports as sp on tm.Sports=sp.SportId left join playlevels as pl on tm.PlayLevel= pl.PlayLevelId where IsApproved="' + IsApproved + '" AND UserId="' + userId + '" Order by TeamId Desc ', function (error1, results, fields) {
     
            if (error1)
            {
              CloseDbConnection(db);
            return res.status(500).send({ message: "Error on the server." });
            }
            CloseDbConnection(db);
           return res.status(200).send(new ResponeModel(numPages, page, results));
          });
        }
        else {
          CloseDbConnection(db);
         return res.status(200).send({ message: "No Data Found" });

        }
      });


    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});

router.post('/GetTeamById', function (req, res, next) {
  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });



    try {
      var teamId = 0;
      var UserId = 0;
      if (!isNaN(req.body.teamId)) {
        teamId = parseInt(req.body.teamId);
      }
      if (!isNaN(req.body.userId)) {
        UserId = parseInt(req.body.userId);
      }
      db = response; 
    //  db.query('SELECT  tm.*,sp.SportId as SportId , sp.Name as Sports,pl.PlayLevelId as PlayLevelId  ,pl.Name as PlayLevel ,us.FirstName as TeamOwnerFirstName ,us.LastName as TeamOwnerLastName,sp.Name as TeamOwnerGame, us.ProfilePic as TeamOwnerProfilePic, us.City as TeamOwnerCity, us.State as TeamOwnerState, us.UserId as TeamOwnerUID FROM teams tm left join sports as sp on tm.Sports=sp.SportId left join playlevels as pl on tm.PlayLevel= pl.PlayLevelId left join users us on tm.CreatedBy=us.UserId where tm.IsDeleted=0 AND tm.TeamId=' + teamId, function (error1, results, fields) {
        db.query('SELECT  tm.*,sp.SportId as SportId , sp.Name as Sports,pl.PlayLevelId as PlayLevelId  ,pl.Name as PlayLevel ,us.FirstName as TeamOwnerFirstName ,us.LastName as TeamOwnerLastName,sp.Name as TeamOwnerGame, us.ProfilePic as TeamOwnerProfilePic, us.City as TeamOwnerCity, us.State as TeamOwnerState, us.UserId as TeamOwnerUID ,(select groupid from groupusers where UserId <> us.UserId and UserId='+UserId+' and groupid in (select distinct gu.groupId from groupusers gu join sportsbox.groups grp on gu.groupId = grp.GroupId where UserId=us.UserId and grp.IsDirectChat=true )) as ExistingGroup_ID FROM teams tm left join sports as sp on tm.Sports=sp.SportId left join playlevels as pl on tm.PlayLevel= pl.PlayLevelId left join users us on tm.CreatedBy=us.UserId where tm.IsDeleted=0 AND tm.TeamId=' + teamId, function (error1, results, fields) {
     
        if (error1) 
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: 'Error on the server.' });
        }
        if (results)
        {
          CloseDbConnection(db);
        return  res.status(200).send(results);
        }
        else
        {
          CloseDbConnection(db);
        return  res.status(200).send({message:'No Record Found!'});
        }
      });



    } catch (err) {
      CloseDbConnection(db);
      console.log('exception:',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});


router.post('/ManageTeam', function (req, res, next) {
  connnectDb(async function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });

    try {
      var teamId = 0;
      if(!isNaN(req.body.teamId))
      {
      teamId = parseInt(req.body.teamId);
      }
      db = response; var arr = [];
      var TeamInfo = null;
      var Sports = null;
      var PlayLevels = null;
      var objmodel = new ManageTeamModel()
      if (teamId != 0) {

        await db.query('SELECT * FROM sports', function (error1, results, fields) {
          if (results) {Sports = results}
          db.query('SELECT * FROM playlevels', function (error1, results1, fields) {
            if (results1) {PlayLevels = results1;}
            db.query('SELECT * FROM teams Where teamId=' + teamId, function (error1, results2, fields) {
              if (error1)
              {
                CloseDbConnection(db);
              return res.status(500).send({ message: 'Error on the server.' });
              }
              if (results2) {TeamInfo = results2;}
              CloseDbConnection(db);
            return  res.status(200).send(new ManageTeamModel(TeamInfo, Sports, PlayLevels));
            });
          });
        });

      } else {

        await db.query('SELECT * FROM sports', function (error1, results, fields) {
          if (results) {Sports = results}
          db.query('SELECT * FROM playlevels', function (error1, results1, fields) {
            if (results1) {PlayLevels = results1;}
            CloseDbConnection(db);
          return  res.status(200).send(new ManageTeamModel(TeamInfo, Sports, PlayLevels));
          });
        });

      }

    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });

});


router.post('/SaveTeam', function (req, res, next) {

  try {
    if (!req.body.TeamName || req.body.TeamName == "" || req.body.TeamName == '') {
      return  res.status(500).send({ message: 'Team Name is missing!' });
    } if (!req.body.Sports || req.body.Sports == "" || req.body.Sports == '') {
      return  res.status(500).send({ message: 'Sports is missing!' });
    } if (!req.body.WhoWeAre || req.body.WhoWeAre == "" || req.body.WhoWeAre == '') {
      return  res.status(500).send({ message: 'WhoWeAre is missing!' });
    } if (!req.body.EstablishmentName || req.body.EstablishmentName == "" || req.body.EstablishmentName == '') {
      return  res.status(500).send({ message: 'EstablishmentName is missing!' });
    } if (!req.body.Gender || req.body.Gender == "" || req.body.Gender == '') {
      return  res.status(500).send({ message: 'Gender is missing!' });
    } if (!req.body.PlayLevel || req.body.PlayLevel == "" || req.body.PlayLevel == '') {
      return  res.status(500).send({ message: 'PlayLevel is missing!' });
    } if (!req.body.PaymentMethod || req.body.PaymentMethod == "" || req.body.PaymentMethod == '') {
      return  res.status(500).send({ message: 'PaymentMethod is missing!' });
    } if (!req.body.City || req.body.City == "" || req.body.City == '') {
      return  res.status(500).send({ message: 'City is missing!' });
    } if (!req.body.State || req.body.State == "" || req.body.State == '') {
      return  res.status(500).send({ message: 'State is missing!' });
    } 
   /*  if (!req.body.PlayerFee || req.body.PlayerFee == "" || req.body.PlayerFee == '') {
      return  res.status(500).send({ message: 'PlayerFee is missing!' });
    } */
     if (!req.body.Message || req.body.Message == "" || req.body.Message == '') {
      return  res.status(500).send({ message: 'Message is missing!' });
    }
    connnectDb(function (Error, response) {
 
      if (Error) {
        return  res.status(500).send({message:'Unabe to Connect to Database!'});
      }
      let TeamId = 0;
      if (!isNaN(req.body.TeamID)) {
        TeamId = parseInt(req.body.TeamID);
      }
      db = response;

      var TeamName = (req.body.TeamName ? req.body.TeamName : "");
      var whoeweare = (req.body.WhoWeAre ? req.body.WhoWeAre : ""); var CaptainsName = (req.body.CaptainsName ? req.body.CaptainsName : "");
      var EstablishmentName = (req.body.EstablishmentName ? req.body.EstablishmentName : ""); var Gender = (req.body.Gender ? req.body.Gender : "");
      var Sports = (req.body.Sports ? req.body.Sports : ""); var PlayLevel = (req.body.PlayLevel ? req.body.PlayLevel : "");
      var PaymentMethod = (req.body.PaymentMethod ? req.body.PaymentMethod : ""); var City = (req.body.City ? req.body.City : "");
      var State = (req.body.State ? req.body.State : ""); var PlayerFee = (req.body.PlayerFee ? req.body.PlayerFee : "");
      var Message = (req.body.Message ? req.body.Message : ""); var image = (req.body.image ? req.body.image : "");
      var VenmoId = (req.body.VenmoId ? req.body.VenmoId : ""); var PaypalId = (req.body.PaypalId ? req.body.PaypalId : "");
      var CreatedBy = (req.body.CreatedBy ? req.body.CreatedBy : null);

      if (TeamId != 0) {

        db.query('SELECT * FROM teams Where TeamId=' + TeamId, function (error1, results, fields) {
          if (error1) {
            console.log('exception7: ',error1);
            CloseDbConnection(db);
            return res.status(500).send({ message: 'Error Occured!' });
          }

          if (results && results.length != 0) {

        //    var query = 'Update teams set TeamName="' + TeamName + '",WhoWeAre="' + whoeweare + '",CaptainsName="' + CaptainsName + '",EstablishmentName="' + EstablishmentName + '",Gender="' + Gender + '",Sports="' + Sports + '",PlayLevel="' + PlayLevel + '",PaymentMethod="' + PaymentMethod + '",City="' + City + '",State="' + State + '",PlayerFee="' + PlayerFee + '",Message="' + Message + '",image="' + image + '",VenmoId="' + VenmoId + '", PaypalId="' + PaypalId + '" where TeamId=' + TeamId;
        //    db.query(query, function (err, results) {
              var query = 'Update teams set TeamName=?,WhoWeAre=?,CaptainsName=?,EstablishmentName=?,Gender=?,Sports=?,PlayLevel=?,PaymentMethod=?,City=?,State=?,PlayerFee=?,Message=?,image=?,VenmoId=?, PaypalId=? where TeamId=?';
              db.query(query,[TeamName,whoeweare,CaptainsName,EstablishmentName,Gender,Sports,PlayLevel,PaymentMethod,City,State,PlayerFee,Message,image,VenmoId,PaypalId,TeamId], function (err, results) {

              if (err)
              {
                console.log('exception6: ',err);
                CloseDbConnection(db);
            return  res.status(500).send({ message: "Error" });
              }
            });
            CloseDbConnection(db);
            return res.status(200).send({ message: "Success" });
          }else
          {
            CloseDbConnection(db);
          return res.status(200).send({ message: "Team Doe's Not Exisit!"});
          }
        });

      } else {



         db.query("SELECT * FROM teams Where TeamName='" + req.body.TeamName + "'", function (error1, results, fields) {

          if (error1) {
            console.log('exception5: ',error1);
         //   CloseDbConnection(db);
            return res.status(500).send({ message: 'Error' });
          }
          if (!results || results.length == 0) {

             var query = "insert into teams (TeamName,WhoWeAre,CaptainsName,EstablishmentName,Gender,Sports,PlayLevel,PaymentMethod,City,State,PlayerFee,Message,image,  VenmoId, PaypalId,CreatedBy)  VALUES  (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
              db.query(query,[TeamName,whoeweare,CaptainsName,EstablishmentName,Gender,Sports,PlayLevel,PaymentMethod,City,State,PlayerFee,Message,image,VenmoId,PaypalId,CreatedBy], async function (err5, result1) {
              if (err5)
              {
                console.log('exception4: ',err5);
             //   CloseDbConnection(db);
              return res.status(500).send({ message: 'Error' });
  
              }
    //.. new stuff
    if (result1 && result1.insertId) {
      let grptype = 'Teams';
        var querys = "insert into sportsbox.groups (GroupName,GroupType,IsDirectChat,CreatedBy)  VALUES  (?,?,?,?)";  
      await  db.query(querys,[TeamName,grptype,0,CreatedBy], async function (err, result) {
          console.log('err' ,err);
        if (err) 
        {
          console.log('exception3: ',err);
          console.log('exception3 mess: ',err.message);
       //   CloseDbConnection(db);
     //  return res.status(500).send({ message: 'Error' });
        }
        

        if (result && result.insertId) {
          var query1 = "insert into groupusers (UserId,GroupId)  VALUES  (" + CreatedBy + "," + result.insertId + ")";
      await    db.query(query1, async function (err1, result2) {
        
            if (err1)
            {
              console.log('exception2: ',err1);
           //   CloseDbConnection(db);
           return res.status(500).send({ message: 'Error' });
            }
          });
  
          var query2 = "insert into chatmessages (GroupId,MessageDescription,CreatedBy)  VALUES  (" + result.insertId + ",'Welcome to Team Group'," + CreatedBy + ")";
      await    db.query(query2, async function (err2, result3) {
            if (err2)
            {
              console.log('exception1: ',err2);
           //   CloseDbConnection(db);
          return  res.status(500).send({ message: 'Error' });
            }


          });


          var query3 = 'Update teams set GroupChatId=' + result.insertId + ' where TeamId=' + result1.insertId;
        await  db.query(query3, async function (err3, result4) {
            if (err3)
            {
              console.log('exception0: ',err3);
        //      CloseDbConnection(db);
          return  res.status(500).send({ message: 'Error' });
            }
            console.log('it reached here');
            return res.status(200).send({ message: 'Success' });
          });
        }


      });
    }
    //...new stuff
  
            });
            //CloseDbConnection(db);
          //  return res.status(200).send({ message: 'Success' });
          }else
          {
            CloseDbConnection(db);
          return res.status(200).send({ message: 'Team Name Already Exisit' });
          }
        }); 









      }


    });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});



async function CrateTeamGroup(TeamID, CreatedBy, db) {
  try {

    db.query(query, function (error, results, fields) {
      //if (error1) return res.status(500).send({ message:'Error on the server.'});
      if (error) {
        CloseDbConnection(db);
        return res.status(500).send({ message: 'Error Occured in Group Creation!' });
      } else {
        //  list = results;

      }
    });

  } catch (error) {
  }
};




router.post('/DeleteTeam', function (req, res, next) {
  try {
    connnectDb(function (Error, response) {
      if (Error) {
      return  res.status(500).send('Unabe to Connect to Database');
      }
      let TeamId = 0;
      if (req.body.TeamID) {
        TeamId = parseInt(req.body.TeamID);
      }
      db = response;
      if (TeamId != 0) {

        db.query('SELECT count(*) as numRows FROM teams where TeamId=' + TeamId, function (error, results, fields) {
     
          if (error) 
          {
            CloseDbConnection(db);
          return res.status(500).send('Error on the server.');
          }
          if (results && results[0] && results[0].numRows) {
            var query = 'Update teams set IsDeleted=true where TeamId=' + TeamId;
            db.query(query, function (err, results) {
        
              if (err)
              {
                CloseDbConnection(db);
              return res.status(500).send({ message: 'Error' });
              }
            });
            CloseDbConnection(db);
            return res.status(200).send({ message: 'Success' });
          }
          else
          {
            CloseDbConnection(db);
            return res.status(200).send({ message: 'No Data Found!' });
          }
        });





      } else {
        CloseDbConnection(db);
        return res.status(200).send({ message: 'TeamId is missing' });
      }
    });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});



router.post('/HnadlePlayersRequest', function (req, res, next) {
  try {
    if (!req.body.IsApproved || req.body.IsApproved == "" || req.body.IsApproved == '') {
    return  res.status(500).send({ message: 'IsApproved Status is missing' });
    }
    connnectDb(function (Error, response) {
      if (Error) {
      return  res.status(500).send('Unabe to Connect to Database');
      }

      db = response;
      let teamid = 0
      let userid = 0;
      if (req.body.teamID)
        teamid = parseInt(req.body.teamID);
      if (req.body.userID)
        userid = parseInt(req.body.userID);
      db.query('SELECT * FROM usersjoinedteams where TeamId="' + teamid + '" and UserId=' + userid, function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'No Such Record Found!' });
        }
        var IsApproved = (req.body.IsApproved ? req.body.IsApproved : "");

        if (results || results.length != 0) {
        
          var query = 'Update usersjoinedteams set IsApproved="' + IsApproved + '" where TeamId=' + teamid + ' and UserId=' + userid + '';
     

          db.query(query, function (err, result1) {
    

            if (err)
            {
              CloseDbConnection(db);
           return res.status(500).send({ message: 'Error' });
            }
          });

           console.log('just before accept');
           //..this sends the user to team chat group
           if(IsApproved=='Accepted')
           {
          db.query('SELECT GroupChatId FROM teams where TeamId=' + teamid, function (error2, result2, fields) {
            if (error2) {  
              console.log('just after accept error2 ',error2);
              CloseDbConnection(db);        
              return res.status(500).send({ message: 'No Such Record Found!' });
            }
            console.log('Accepted case and selecting chatgroupid= ',result2);
            if (result2 || result2.length != 0) {
              var query = "insert into groupusers (UserId,GroupId)  VALUES  (" + userid + "," + result2[0].GroupChatId + ")";
              db.query(query, function (err3, result3) {
                if (err3)
                {
                  console.log('just after after accept err3 ',err3);
                  CloseDbConnection(db);
               return res.status(500).send({ message: 'Error' });
                } 
                console.log('inseerted in groupusers on player joining request ');
              });
 
            }
          });
        }
                //..notification sending call
               SendPushNotification(userid,"Your Request For Joining team has been "+IsApproved);
               CloseDbConnection(db);
          return res.status(200).send({ message: 'Successfully Updated!' });
        }else
        {
          CloseDbConnection(db);
        return res.status(200).send({ message: 'No Record Found!' });
        }
      });
    });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});



router.post('/SpecificSport_TeamExist', function (req, res, next) {
  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });


    try {
      var UserID = 0;
      var TeamName = '';
      UserID = parseInt(req.body.UserID);
      SportID = String(req.body.SportID);
      if (SportID != 0) {
        db = response; var arr = [];

     
        db.query('CALL GetTeamsList_procedure();', function (error1, results, fields) {

  
          if (error1)
          {
            CloseDbConnection(db);
          return res.sendStatus(500).send({ message: 'Error on the server.' });
          }
          if (results)
     
          if (results && results[0] && results[0].numRows) {
            CloseDbConnection(db);
         return   res.sendStatus(200).send(results[0].numRows);
          }
          else {
            CloseDbConnection(db);
         return   res.sendStatus(200).send('');
          }
        });

      }

    } catch (err) {
      CloseDbConnection(db);
      console.log('exception:' ,err);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});

router.post('/joinedplayerslist', function (req, res, next) {


  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      var teamId = 0;
      var UserId = 0;
      if (!isNaN(req.body.teamId)) {
        teamId = parseInt(req.body.teamId);
      }
      if (!isNaN(req.body.loggedInUserID)) {
        UserId = parseInt(req.body.loggedInUserID);
      }
     
      db = response; var arr = [];
      let accepted = 'Accepted';
      db.query('SELECT count(*) as numRows FROM usersjoinedteams as ujt left join users as us on us.UserId=ujt.UserId where ujt.IsApproved="' + accepted + '" AND ujt.TeamId=' + teamId, function (error, results, fields) {
      
        if (error) 
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }
   

        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
          db.query('SELECT ujt.*,us.*,(select groupid from groupusers where UserId <> us.UserId and UserId='+ UserId +' and groupid in (select distinct gu.groupId from groupusers gu join sportsbox.groups grp on gu.groupId = grp.GroupId where UserId=us.UserId and grp.IsDirectChat=true )) as ExistingGroup_ID FROM usersjoinedteams as ujt left join users as us on us.UserId=ujt.UserId where ujt.IsApproved="' + accepted + '" AND ujt.TeamId="' + teamId + '" Order by TeamId Desc ', function (error1, results1, fields) {
            if (error1)
            {
              CloseDbConnection(db);
            return res.status(500).send({ message: "Error on the server." });
            }
            CloseDbConnection(db);
           return  res.status(200).send(new ResponeModel(numPages, page, results1));
          });
        }
        else {
          CloseDbConnection(db);
        return  res.status(200).send({ message: "" });
         }
      });


    } catch (err) {
      CloseDbConnection(db);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});


router.post('/PlayersRequestslist', function (req, res, next) {


  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      var teamId = 0;
      teamId = parseInt(req.body.teamId);
      db = response; var arr = [];
      let pending = 'Pending';
      let rejected = 'Rejected'
      db.query('SELECT count(*) as numRows FROM usersjoinedteams as ujt left join users as us on us.UserId=ujt.UserId where (ujt.IsApproved="' + pending + '" ||ujt.IsApproved="' + rejected + '") AND ujt.TeamId=' + teamId, function (error, results, fields) {
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }
        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
          db.query('SELECT * FROM usersjoinedteams as ujt left join users as us on us.UserId=ujt.UserId where (ujt.IsApproved="' + pending + '" ||ujt.IsApproved="' + rejected + '") AND ujt.TeamId="' + teamId + '" Order by TeamId Desc LIMIT ' + limit, function (error1, results1, fields) {
            if (error1)
            {
              CloseDbConnection(db);
            return res.status(500).send({ message: "Error on the server." });
            }
            CloseDbConnection(db);
          return  res.status(200).send(new ResponeModel(numPages, page, results1));
          });
        }
        else {
          CloseDbConnection(db);
         return res.status(200).send({ message: "" });
   
        }
      });


    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});



router.post('/joinedleagueslist', function (req, res, next) {


  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      var teamId = 0;
      teamId = parseInt(req.body.teamId);
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM joinedteamsinleague where TeamId=' + teamId, function (error, results, fields) {
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }
      
        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
           db.query('SELECT lg.LeagueId, lg.LeagueName,lg.Gender,lg.Season,lg.City,lg.State,lg.image,lg.LeagueFee,sp.Name as Sports,pl.Name as PlayLevel,lg.Day FROM joinedteamsinleague as jtl left join leagues as lg on lg.LeagueId=jtl.LeagueId left join sports as sp on lg.Sports=sp.SportId left join playlevels as pl on lg.PlayLevel= pl.PlayLevelId where TeamId="' + teamId + '" Order by TeamId Desc LIMIT ' + limit, function (error1, results1, fields) {
            if (error1)
            {

              CloseDbConnection(db);
            return res.status(500).send({ message: "Error on the server." });
            }
            CloseDbConnection(db);
           return  res.status(200).send(new ResponeModel(numPages, page, results1));
          });
        }
        else {
          CloseDbConnection(db);
         return res.status(200).send({ message: "" });
        }
      });


    } catch (err) {
      CloseDbConnection(db);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});


router.post('/SearchTeamsList', function (req, res, next) {

  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      let TeamName = '';
      if (req.body.TeamName) {
        TeamName = req.body.TeamName;
      }
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM teams tm where tm.IsDeleted=false AND tm.TeamName LIKE "%' + TeamName + '%"', function (error, results, fields) {
        if (error) 
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }
     

        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);

          db.query('SELECT  tm.*,sp.SportId as SportId , sp.Name as Sports,pl.PlayLevelId as PlayLevelId  ,pl.Name as PlayLevel FROM teams tm left join sports as sp on tm.Sports=sp.SportId left join playlevels as pl on tm.PlayLevel= pl.PlayLevelId where tm.IsDeleted=false AND tm.TeamName LIKE "%' + TeamName + '%" Order by TeamId Desc LIMIT ' + limit, function (error1, results, fields) {
  
            if (error1)
            {
              CloseDbConnection(db);
            return res.status(500).send({ message: "Error on the server." });
            }
            CloseDbConnection(db);
         return   res.status(200).send(new ResponeModel(numPages, page, results));
          });
        }
        else {
          CloseDbConnection(db);
        return  res.status(200).send({ message: "No Data Found" });

        }
      });


    } catch (err) {
      CloseDbConnection(db);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});


router.post('/SaveTeamJoiningRequest', function (req, res, next) {
  try {

    connnectDb(function (Error, response) {
      if (Error) {
     return   res.status(500).send('Unabe to Connect to Database');
      }

      db = response;
      let userid=0;
      let teamid=0;
      if (!isNaN(req.body.teamID)) {
      teamid = parseInt(req.body.teamID);
      }
      if (!isNaN(req.body.userID)) {
      userid = parseInt(req.body.userID);
      }
      let Name= (req.body.Name ? req.body.Name : "");
      let PaymentModule=(req.body.PaymentModule ? req.body.PaymentModule : "");
      let PaymentType=(req.body.PaymentType ? req.body.PaymentType : "");

  
      db.query('SELECT * FROM usersjoinedteams where UserId='+userid+' and TeamId='+teamid, function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
           return res.status(500).send({ message: 'No Such Record Found!' });
        }
        let IsApproved = 'Pending';
 
        if (!results || results.length == 0) {
          var query = "insert into usersjoinedteams (UserId,TeamId,IsApproved)VALUES  (" + userid + "," + teamid + ",'" + IsApproved + "')";

          db.query(query, function (err, result) {
            if (err) 
            {
              CloseDbConnection(db);
          return  res.status(500).send({ message: 'Error' });
            }
            //   var query1 = "insert into payments (Name,PaymentModule,PaymentType,TeamId,UserId)VALUES  ('" + Name + "','" + PaymentModule + "','" + PaymentType + "',"+teamid+","+userid+")";
           //   db.query(query1, function (err, result) {
                var query1 = "insert into payments (Name,PaymentModule,PaymentType,TeamId,UserId)VALUES  (?,?,?,?,?)";
                db.query(query1,[Name,PaymentModule,PaymentType,teamid,userid], function (err, result) {
                if (err)
                {
                  CloseDbConnection(db);
               return res.status(500).send({ message: 'Error' });
                }
              });
              
               //..notification sending call
              // const Notifications = new PushNotifications();
              // Notifications.SendPushNotificationOnTeamJoining(teamid,"New Player Joining Request Arrives!");
               SendPushNotificationOnTeamJoining(teamid,"New Player Joining Request Arrived!");
               CloseDbConnection(db);
              return res.status(200).send({ message: 'Successfully Submitted!' });
      //      }
            });

          }else
          {
            CloseDbConnection(db);
          return res.status(200).send({ message: 'Team Joining Request Already Exist!' });
          }
          });
                 
      });

  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});


router.post('/Rosterleagueslist', function (req, res, next) {


  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      let IsApproved='Accepted';
      var teamId = 0;
      teamId = parseInt(req.body.teamId);
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM joinedteamsinleague where IsApproved="'+IsApproved+'" and TeamId=' + teamId, function (error, results, fields) {
  
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }
  

        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
          db.query('SELECT lg.LeagueId, lg.LeagueName,lg.Gender,lg.Season,lg.City,lg.State,lg.image,lg.LeagueFee,sp.Name as Sports,pl.Name as PlayLevel FROM joinedteamsinleague as jtl left join leagues as lg on lg.LeagueId=jtl.LeagueId left join sports as sp on lg.Sports=sp.SportId left join playlevels as pl on lg.PlayLevel= pl.PlayLevelId where jtl.IsApproved="'+IsApproved+'" and TeamId="' + teamId + '" Order by TeamId Desc LIMIT ' + limit, function (error1, results1, fields) {
            if (error1)
            {
              CloseDbConnection(db);
            return res.status(500).send({ message: "Error on the server." });
            }
            CloseDbConnection(db);
           return res.status(200).send(new ResponeModel(numPages, page, results1));
          });
        }
        else {
          CloseDbConnection(db);
        return  res.status(200).send({ message: "" });
         }
      });


    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});




router.post('/RosterPlayerslist', function (req, res, next) {

  connnectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      let IsApproved='Accepted';
      let TeamId=0;
      let LeagueId=0;
      let UserId = 0;
      if (!isNaN(req.body.TeamID)) {
        TeamId = parseInt(req.body.TeamID);
      }
        if (!isNaN(req.body.LeagueID)) {
        LeagueId = parseInt(req.body.LeagueID);
      }
      if (!isNaN(req.body.userId)) {
        UserId = parseInt(req.body.userId);
      }
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows from usersjoinedteams ujt left join users us  on us.UserId = ujt.UserId left join teamroster tr on us.UserId = tr.UserID  and tr.LeagueId = '+LeagueId+' left join leagues l on tr.LeagueId = l.LeagueId where ujt.TeamID= '+TeamId+' and IsApproved="' + IsApproved+'"', function (error, results, fields) {
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }
   
        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
        //  db.query('select tr.IsActive,tr.RosterId,l.RoasterSubmissionDeadline,case when l.RoasterSubmissionDeadline >= curDate() then 1 else 0 end as IsRoasterActive ,us.* from usersjoinedteams ujt left join users us  on us.UserId = ujt.UserId left join teamroster tr on us.UserId = tr.UserID  and tr.LeagueId = '+LeagueId+' left join leagues l on tr.LeagueId = l.LeagueId where ujt.TeamID= '+TeamId+' and IsApproved="' + IsApproved + '" Order by us.UserId Desc LIMIT ' + limit, function (error1, results1, fields) {
            db.query('select tr.IsActive,tr.RosterId,l.RoasterSubmissionDeadline,case when l.RoasterSubmissionDeadline >= curDate() then 1 else 0 end as IsRoasterActive ,us.* , (select GroupId from groupusers where UserId <> us.UserId and UserId='+UserId+' and groupid in (select distinct gu.groupId from groupusers gu join sportsbox.groups grp on gu.groupId = grp.GroupId where UserId=us.UserId and grp.IsDirectChat=true )) AS ExistingGroup_ID  from usersjoinedteams ujt left join users us  on us.UserId = ujt.UserId left join teamroster tr on us.UserId = tr.UserID  and tr.LeagueId = '+LeagueId+' left join leagues l on tr.LeagueId = l.LeagueId where ujt.TeamID= '+TeamId+' and IsApproved="' + IsApproved + '" Order by us.UserId Desc ', function (error1, results1, fields) {
         
            if (error1) 
            {
              console.log('error1 ',error1);
              CloseDbConnection(db);
            return res.status(500).send({ message: "Error on the server." });
            }
            CloseDbConnection(db);
           return res.status(200).send(new ResponeModel(numPages, page, results1));
          });
        }
        else {
          CloseDbConnection(db);
        return  res.status(200).send({ message: "" });
        }
      });


    } catch (err) {
      CloseDbConnection(db);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});



router.post('/AddPlayerInRoster', function (req, res, next) {
  try {
    connnectDb(function (Error, response) {
      if (Error) {
      return  res.status(500).send('Unabe to Connect to Database');
      }
      let TeamId=0;
      let LeagueId=0;
      let UserId=0;
      if (!isNaN(req.body.TeamID)) {
        TeamId = parseInt(req.body.TeamID);
      }
        if (!isNaN(req.body.LeagueID)) {
        LeagueId = parseInt(req.body.LeagueID);
      }
      if (!isNaN(req.body.UserID)) {
        UserId = parseInt(req.body.UserID);
      }
      db = response;

        var query = "insert into teamroster (UserID,TeamID,LeagueID,IsActive)VALUES  (" + UserId + "," + TeamId + "," + LeagueId + ",true)";

        db.query(query, function (err, result) {
          if (err)
          {
            CloseDbConnection(db);
        return  res.status(500).send({ message: 'Error' });
          }
          CloseDbConnection(db);
            return res.status(200).send({ message: 'Successfully Submitted!' });
          });


    });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});
router.post('/RemovePlayerFromRoster', function (req, res, next) {
  try {
    connnectDb(function (Error, response) {
      if (Error) {
      return  res.status(500).send('Unabe to Connect to Database');
      }
      let RosterId=0;
      if (!isNaN(req.body.RosterID)) {
        RosterId = parseInt(req.body.RosterID);
      }
      db = response;
      if (RosterId != 0) {

        db.query('SELECT count(*) as numRows FROM teamroster where RosterId=' + RosterId, function (error, results, fields) {
           if (error) 
           {
            CloseDbConnection(db);
           return res.status(500).send('Error on the server.');
           }
          if (results && results[0] && results[0].numRows) {
            var query = 'Update teamroster set IsActive=false where RosterId=' + RosterId;
            db.query(query, function (err, results) {
              if (err)
              {
                CloseDbConnection(db);
              return res.status(500).send({ message: 'Error' });
              }
            });
            CloseDbConnection(db);
            return res.status(200).send({ message: 'Success' });
          }
          else
          {
            CloseDbConnection(db);
            return res.status(200).send({ message: 'No Data Found!' });
          }
        });





      } else {
        CloseDbConnection(db);
        return res.status(200).send({ message: 'RosterId is missing' });
      }
    });
  } catch (err) {
    next();
    CloseDbConnection(db);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});
router.post('/UpdatePlayerFromRoster', function (req, res, next) {
  try {
    connnectDb(function (Error, response) {
      if (Error) {
       return res.status(500).send('Unabe to Connect to Database');
      }
      let RosterId=0;
      if (!isNaN(req.body.RosterID)) {
        RosterId = parseInt(req.body.RosterID);
      }
      db = response;
      if (RosterId != 0) {

        db.query('SELECT count(*) as numRows FROM teamroster where RosterId=' + RosterId, function (error, results, fields) {
          if (error)
          {    
            CloseDbConnection(db);     
          return res.status(500).send('Error on the server.');
          }
          if (results && results[0] && results[0].numRows) {
            var query = 'Update teamroster set IsActive=true where RosterId=' + RosterId;
            db.query(query, function (err, results) {
              if (err) 
              {
                CloseDbConnection(db);
              return res.status(500).send({ message: 'Error' });
              }
            });
            CloseDbConnection(db);
            return res.status(200).send({ message: 'Success' });
          }
          else
          {
            CloseDbConnection(db);
            return res.status(200).send({ message: 'No Data Found!' });
          }
        });





      } else {
        CloseDbConnection(db);
        return res.status(200).send({ message: 'RosterId is missing' });
      }
    });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});



module.exports = router;