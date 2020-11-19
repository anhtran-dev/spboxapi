var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var connectDb = require('./DbConnection');
var ResponeModel = require('./Models/ResponeModel');
var ManageleagueModel = require('./Models/ManageLeagueModel');
var ManageGameScheduleModel = require('./Models/ManageGameScheduleModel');
var ManageDivisionModel = require('./Models/ManageDivisionModel');

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

//var PushNotifications =require('./PushNotifications');
//var SendPushNotificationOnTeamJoining =require('./PushNotifications');
//var SendPushNotificationOnLeagueJoining =require('./PushNotifications');
const CloseDbConnection =require('./common');
var fetch = require('node-fetch');

var db;

async function SendPushNotification(UserID,NotificationText) {


  try {

      console.log('its called in push noptification');

      connectDb(function (error, response) {
            if (error) return "Unabe to Connect to Database";
            if(response)
            console.log(response);
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
  

    connectDb(function (Error, response) {
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
async function SendPushNotificationOnLeagueJoining(LeagueID,NotificationText) {

  try {
  

    connectDb(function (Error, response) {
        if (Error) return "'Unabe to Connect to Database'";
        try {
          var LeagueId = 0;
          if(!isNaN(LeagueID))
          {
            LeagueId = parseInt(LeagueID);
          }
          db = response; var messages = [];
          db.query('SELECT * from leagues  where LeagueId=' + LeagueId, function (error1, results, fields) {
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
} catch (error) {
  return error;
}


};
const SendPushNotification_WithInClass = (UserID,NotificationText) => {
  try {


    connectDb(function (Error, response) {
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

router.post('/GetLeaguesList', function (req, res, next) {
  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message:'Unabe to Connect to Database'});
    var numPerPage = parseInt(req.body.npp, 10) || 10;
    var page = parseInt(req.body.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {

      db = response;
      db.query('SELECT count(*) as numRows FROM leagues', function (error, results, fields) {
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send('Error on the server.');
        }
        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);

          db.query('SELECT  lg.*,sp.SportId as SportId,sp.Name as Sports,pl.PlayLevelId as PlayLevelId,pl.Name as PlayLevel FROM leagues lg left join sports as sp on lg.Sports=sp.SportId left join playlevels as pl on lg.PlayLevel= pl.PlayLevelId where lg.IsDeleted=0 Order by LeagueId Desc LIMIT ' + limit, function (error1, results, fields) {
            if (error1) 
            {
              CloseDbConnection(db);
            return res.status(500).send('Error on the server.');
            }
            CloseDbConnection(db);
          return  res.status(200).send(new ResponeModel(numPages, page, results));
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
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});

router.post('/GetJoinedLeaguesList', function (req, res, next) {
  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message:'Unabe to Connect to Database'});
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {

      var IsApproved = 'Accepted';
      let CreatedBy = 0;
      if (!isNaN(req.body.UserID)) {
        CreatedBy = req.body.UserID;
      }
       db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM joinedteamsinleague jtl left join leagues lg on lg.LeagueId=jtl.LeagueId left join teams tm on jtl.TeamId =tm.TeamId where jtl.IsApproved="'+IsApproved+'" AND tm.CreatedBy='+CreatedBy, function (error, results, fields) {
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({message:'Error on the server.1'});
        }
        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
     
          db.query('SELECT lg.*,tm.*,sp.Name as SportsName,pl.Name as PlaylevelName FROM joinedteamsinleague jtl left join leagues lg on lg.LeagueId=jtl.LeagueId left join teams tm on jtl.TeamId =tm.TeamId left join sports sp on lg.Sports=sp.SportId left join playlevels pl on lg.PlayLevel=pl.PlayLevelId where jtl.IsApproved="'+IsApproved+'" AND tm.CreatedBy='+CreatedBy+' Order by jtl.LeagueId Desc ', function (error1, results, fields) {
            if (error1) 
            {
              CloseDbConnection(db);
            return res.status(500).send({message:'Error on the server.'});
            }
            CloseDbConnection(db);
          return  res.status(200).send(new ResponeModel(numPages, page, results));
          });
        }
        else
        {
          CloseDbConnection(db);
        return  res.status(200).send({ message: 'No Data Found' });
        }
      });
    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});
router.post('/GetRequestedLeaguesList', function (req, res, next) {
  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {

      let IsPending = 'Pending';
      let IsRejected = 'Rejected';
      let CreatedBy = 0;
      if (!isNaN(req.body.UserID)) {
        CreatedBy = req.body.UserID;
      }
       db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM joinedteamsinleague jtl left join leagues lg on lg.LeagueId=jtl.LeagueId left join teams tm on jtl.TeamId =tm.TeamId where (jtl.IsApproved="'+IsPending+'" ||jtl.IsApproved="'+IsRejected+'") AND tm.CreatedBy='+CreatedBy, function (error, results, fields) {
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({message:'Error on the server.1'});
        }
        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
     
          db.query('SELECT lg.*,tm.*,sp.Name as SportsName,pl.Name as PlaylevelName FROM joinedteamsinleague jtl left join leagues lg on lg.LeagueId=jtl.LeagueId left join teams tm on jtl.TeamId =tm.TeamId left join sports sp on lg.Sports=sp.SportId left join playlevels pl on lg.PlayLevel=pl.PlayLevelId where (jtl.IsApproved="'+IsPending+'" ||jtl.IsApproved="'+IsRejected+'") AND tm.CreatedBy='+CreatedBy+' Order by jtl.LeagueId Desc ', function (error1, results, fields) {
            if (error1)
            {
              CloseDbConnection(db);
            return res.status(500).send({message:'Error on the server.'});
            }
            CloseDbConnection(db);
          return  res.status(200).send(new ResponeModel(numPages, page, results));
          });
        }
        else
        {
          CloseDbConnection(db);
        return  res.status(200).send({ message: 'No Data Found' });
        }
      });
    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});

router.post('/SearchJoinedLeaguesList', function (req, res, next) {
  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message:'Unabe to Connect to Database'});
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {

      var IsApproved = 'Accepted';
      let CreatedBy = 0;
      let SearchText = '';
      if (!isNaN(req.body.UserID)) {
        CreatedBy = req.body.UserID;
      }
      if (req.body.LeagueName) {
        SearchText = req.body.LeagueName;
       }
       db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM joinedteamsinleague jtl left join leagues lg on lg.LeagueId=jtl.LeagueId left join teams tm on jtl.TeamId =tm.TeamId where jtl.IsApproved="'+IsApproved+'" AND tm.CreatedBy='+CreatedBy, function (error, results, fields) {
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({message:'Error on the server.1'});
        }
        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
     
          db.query('SELECT lg.*,tm.*,sp.Name as SportsName,pl.Name as PlaylevelName FROM joinedteamsinleague jtl left join leagues lg on lg.LeagueId=jtl.LeagueId left join teams tm on jtl.TeamId =tm.TeamId left join sports sp on lg.Sports=sp.SportId left join playlevels pl on lg.PlayLevel=pl.PlayLevelId where jtl.IsApproved="'+IsApproved+'" AND tm.CreatedBy='+CreatedBy+' and lg.LeagueName LIKE "%'+SearchText+'%" Order by jtl.LeagueId Desc LIMIT ' + limit, function (error1, results, fields) {
            if (error1) 
            {
              CloseDbConnection(db);
            return res.status(500).send({message:'Error on the server.'});
            }
            CloseDbConnection(db);
          return  res.status(200).send(new ResponeModel(numPages, page, results));
          });
        }
        else
        {
          CloseDbConnection(db);
          return  res.status(200).send(new ResponeModel(numPages, page, results=null));
        }
      });
    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});
router.post('/SearchRequestedLeaguesList', function (req, res, next) {
  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {

      let IsPending = 'Pending';
      let IsRejected = 'Rejected';
      let CreatedBy = 0;
      let SearchText = '';
      if (!isNaN(req.body.UserID)) {
        CreatedBy = req.body.UserID;
      }
      if (req.body.LeagueName) {
        SearchText = req.body.LeagueName;
       }
       db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM joinedteamsinleague jtl left join leagues lg on lg.LeagueId=jtl.LeagueId left join teams tm on jtl.TeamId =tm.TeamId where (jtl.IsApproved="'+IsPending+'" ||jtl.IsApproved="'+IsRejected+'") AND tm.CreatedBy='+CreatedBy, function (error, results, fields) {
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({message:'Error on the server.1'});
        }
        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
     
          db.query('SELECT lg.*,tm.*,sp.Name as SportsName,pl.Name as PlaylevelName FROM joinedteamsinleague jtl left join leagues lg on lg.LeagueId=jtl.LeagueId left join teams tm on jtl.TeamId =tm.TeamId left join sports sp on lg.Sports=sp.SportId left join playlevels pl on lg.PlayLevel=pl.PlayLevelId where (jtl.IsApproved="'+IsPending+'" ||jtl.IsApproved="'+IsRejected+'") AND tm.CreatedBy='+CreatedBy+' and lg.LeagueName LIKE "%'+SearchText+'%" Order by jtl.LeagueId Desc LIMIT ' + limit, function (error1, results, fields) {
            if (error1)
            {
              CloseDbConnection(db);
            return res.status(500).send({message:'Error on the server.'});
            }
            CloseDbConnection(db);
          return  res.status(200).send(new ResponeModel(numPages, page, results));
          });
        }
        else
        {
          CloseDbConnection(db);
          return  res.status(200).send(new ResponeModel(numPages, page, results=null));
        }
      });
    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});






router.post('/SearchLeagues', function (req, res, next) {
  connectDb(function (Error, response) {
      if (Error) return res.status(500).send({ message: 'Error' });
      var numPerPage = parseInt(req.params.npp, 10) || 10;
      var page = parseInt(req.params.page, 10) || 0;
      var numPages;
      var skip = page * numPerPage;
      // Here we compute the LIMIT parameter for MySQL query
      var limit = skip + ',' + numPerPage;
try{

  let LeagueName = '';
  if (req.body.LeagueName) {
    LeagueName = req.body.LeagueName;
  }  
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM leagues lg where lg.IsDeleted=false AND lg.LeagueName LIKE "%'+LeagueName+'%"', function (error, results, fields) {
          if (error)
          {
            CloseDbConnection(db);
          return res.status(500).send({message:'Error on the server.'});
          }
          if (results && results[0] && results[0].numRows){
              numRows = results[0].numRows;
              numPages = Math.ceil(numRows / numPerPage);
              db.query('SELECT  lg.*,sp.SportId as SportId,sp.Name as Sports,pl.PlayLevelId as PlayLevelId,pl.Name as PlayLevel FROM leagues lg left join sports as sp on lg.Sports=sp.SportId left join playlevels as pl on lg.PlayLevel= pl.PlayLevelId where lg.IsDeleted=false AND lg.LeagueName LIKE "%'+LeagueName+'%" Order by lg.LeagueId Desc LIMIT '+ limit, function (error1, results1, fields) {
                  if (error1)
                  {
                    CloseDbConnection(db);
                  return res.status(500).send({message:'Error on the server.'});  
                  }
                  CloseDbConnection(db);
                 return res.status(200).send(new ResponeModel(numPages,page,results1));
              });
          }
          else
          {
            CloseDbConnection(db);
         return res.status(200).send({message:'No Data Found!'});
          }
      });        
}catch (err) {
  CloseDbConnection(db);
  console.log('exception: ',err);
 return res.status(500).send({ message: 'Error Occurred: ' + err });
}
  });
});


router.post('/GetLeagueById', function (req, res, next) {
  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message:'Unabe to Connect to Database'});
    try {
      var leagueId = 0;
      var UserId = 0;
      if (!isNaN(req.body.leagueId)) {
      leagueId = parseInt(req.body.leagueId);
      }
      if (!isNaN(req.body.userId)) {
        UserId = parseInt(req.body.userId);
      }
      db = response; var arr = [];
      db.query('SELECT  lg.*,sp.SportId as SportId ,sp.Name as Sports,pl.PlayLevelId as PlayLevelId,pl.Name as PlayLevel ,us.FirstName as LeagueOwnerFirstName ,us.LastName as LeagueOwnerLastName,sp.Name as LeagueOwnerGame, us.ProfilePic as LeagueOwnerProfilePic,us.City as LeagueOwnerCity,us.State as LeagueOwnerState,us.UserId as LeagueOwnerUID ,(select GroupId from groupusers where UserId <> us.UserId and UserId='+UserId+' and groupid in (select distinct gu.groupId from groupusers gu join sportsbox.groups grp on gu.groupId = grp.GroupId where UserId=us.UserId and grp.IsDirectChat=true )) AS ExistingGroup_ID FROM leagues lg left join sports as sp on lg.Sports=sp.SportId left join playlevels as pl on lg.PlayLevel= pl.PlayLevelId left join users us on lg.CreatedBy=us.UserId where lg.LeagueId=' + leagueId, function (error1, results, fields) {
        if (error1)
        {
          CloseDbConnection(db);
        return res.status(500).send('Error on the server.');
        }
        if (results)
        {
          CloseDbConnection(db);
         return res.status(200).send(results);
        }
        else
        {
          CloseDbConnection(db);
         return res.status(200).send('');
        }
      });
    } catch (err) {
      CloseDbConnection(db);
      console.log('exception ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});

router.post('/ManageLeague', function (req, res, next) {
  connectDb(async function (Error, response) {
    if (Error) return res.status(500).send({ message:'Unabe to Connect to Database'});



    try {
      var leagueId = 0;
      if (!isNaN(req.body.leagueid)) {
        leagueId = parseInt(req.body.leagueid);
      }
      db = response; var arr = [];
      var LeagueInfo = null;
      var Sports = null;
      var PlayLevels = null;
      var objmodel = new ManageleagueModel();
      if (leagueId != 0) {
   
        await db.query('SELECT * FROM sports', function (error1, results, fields) {
          //    if (error1) return res.status(500).send({ message:'Error on the server.'});
          if (results) {
            Sports = results
          }
          db.query('SELECT * FROM playlevels', function (error1, results1, fields) {
            if (results1) {
              PlayLevels = results1;
            }

            db.query('SELECT * FROM leagues Where LeagueId=' + leagueId, function (error1, results2, fields) {
              if (error1) return res.status(500).send({ message: 'Error on the server.' });
              if (results2) {
                LeagueInfo = results2;
              }
              CloseDbConnection(db);
             return res.status(200).send(new ManageleagueModel(LeagueInfo, Sports, PlayLevels));
            });
          });

        });
      } else {
        await db.query('SELECT * FROM sports', function (error1, results, fields) {
          //  if (error1) return res.status(500).send({ message:'Error on the server.'});
          if (results) {
            Sports = results
          }
          db.query('SELECT * FROM playlevels', function (error1, results1, fields) {
            if (results1) {
              PlayLevels = results1;
            }
            CloseDbConnection(db);
          return  res.status(200).send(new ManageleagueModel(LeagueInfo, Sports, PlayLevels));
          });

        });
      }

    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});

router.post('/SaveLeague', function (req, res, next) {
  try {

    if (!req.body.LeagueName || req.body.LeagueName == "" || req.body.LeagueName == '') {
      return  res.status(500).send({ message: 'League Name is missing!' });
    } if (!req.body.Sports || req.body.Sports == "" || req.body.Sports == '') {
      return  res.status(500).send({ message: 'Sports is missing!' });
    } if (!req.body.WhoWeAre || req.body.WhoWeAre == "" || req.body.WhoWeAre == '') {
      return  res.status(500).send({ message: 'WhoWeAre is missing!' });
    } 

    if (!req.body.Gender || req.body.Gender == "" || req.body.Gender == '') {
      return   res.status(500).send({ message: 'Gender is missing!' });
    } if (!req.body.PlayLevel || req.body.PlayLevel == "" || req.body.PlayLevel == '') {
      return  res.status(500).send({ message: 'PlayLevel is missing!' });
    } if (!req.body.PaymentMethod || req.body.PaymentMethod == "" || req.body.PaymentMethod == '') {
      return  res.status(500).send({ message: 'PaymentMethod is missing!' });
    } if (!req.body.City || req.body.City == "" || req.body.City == '') {
      return  res.status(500).send({ message: 'City is missing!' });
    } if (!req.body.State || req.body.State == "" || req.body.State == '') {
      return  res.status(500).send({ message: 'State is missing!' });
    } if (!req.body.LeagueFee || req.body.LeagueFee == "" || req.body.LeagueFee == '') {
      return  res.status(500).send({ message: 'LeagueFee is missing!' });
    }
    connectDb(function (Error, response) {
      if (Error) {

        return  res.status(500).send({ message:'Unabe to Connect to Database'});
      }
      let LeagueId = 0;
      if (!isNaN(req.body.leagueid)) {
        LeagueId = parseInt(req.body.leagueid);
      }
      db = response;

      let LeagueName = (req.body.LeagueName ? req.body.LeagueName : "");
      let whoeweare = (req.body.WhoWeAre ? req.body.WhoWeAre : ""); let CaptainsName = (req.body.CaptainsName ? req.body.CaptainsName : "");
      let City = (req.body.City ? req.body.City : ""); let State = (req.body.State ? req.body.State : "");
      let Gender = (req.body.Gender ? req.body.Gender : ""); let Sports = (req.body.Sports ? req.body.Sports : "");
      let PlayLevel = (req.body.PlayLevel ? req.body.PlayLevel : ""); let PaymentMethod = (req.body.PaymentMethod ? req.body.PaymentMethod : "");
      let VenmoId = (req.body.VenmoId ? req.body.VenmoId : ""); let PaypalId = (req.body.PaypalId ? req.body.PaypalId : "");
      let GamesPerSeason = (req.body.GamesPerSeason ? req.body.GamesPerSeason : "");
      let Day = (req.body.Day ? req.body.Day : ""); let PlayersPerTeamMax = (req.body.PlayersPerTeamMax ? req.body.PlayersPerTeamMax : "");
      let PlayerAge = (req.body.PlayerAge ? req.body.PlayerAge : "");
      let Season = (req.body.Season ? req.body.Season : ""); let image = (req.body.topBannerImage ? req.body.topBannerImage : "");

      let LeagueStartDate = (req.body.LeagueStartDate ? req.body.LeagueStartDate : ''); 
      let LeagueEndDate = (req.body.LeagueEndDate ? req.body.LeagueEndDate : '');
      let RegistrationDeadline = (req.body.RegistrationDeadline ? req.body.RegistrationDeadline : '');
      let RoasterSubmissionDeadline = (req.body.RoasterSubmissionDeadline ? req.body.RoasterSubmissionDeadline : '');

       let StartTime = (req.body.StartTime ? req.body.StartTime : "");
      let EndTime = (req.body.EndTime ? req.body.EndTime : "");

      let LeagueFee = (req.body.LeagueFee ? req.body.LeagueFee : ""); let CreatedBy = (req.body.CreatedBy ? req.body.CreatedBy : null);
      let Message= (req.body.Message ? req.body.Message : ""); 

      let d = new Date(LeagueStartDate);
      let day = d.getDate()
      let monthIndex = d.getMonth();
      let year = d.getFullYear();
      LeagueStartDate = year +"-"+ monthIndex +"-"+ day;
   
          d = new Date(LeagueEndDate);
          day = d.getDate()
          monthIndex = d.getMonth();
          year = d.getFullYear();
          LeagueEndDate = year +"-"+ monthIndex +"-"+ day;

          d = new Date(RegistrationDeadline);
          day = d.getDate()
          monthIndex = d.getMonth();
          year = d.getFullYear();
          RegistrationDeadline = year +"-"+ monthIndex +"-"+ day;

          d = new Date(RoasterSubmissionDeadline);
          day = d.getDate()
          monthIndex = d.getMonth();
          year = d.getFullYear();
          RoasterSubmissionDeadline = year +"-"+ monthIndex +"-"+ day;





      if(LeagueId!=0)
      {



        db.query('SELECT * FROM leagues Where LeagueId='+ LeagueId, function (error1, results, fields) {
          if (error1) {
            CloseDbConnection(db);
            return res.status(500).send({ message: 'Error' });
          }
          if (results && results.length != 0) {
           
          //  var query = "Update leagues set LeagueName='" + LeagueName + "',WhoWeAre='" + whoeweare + "',CaptainsName='" + CaptainsName + "',City='" + City + "',State='" + State + "',Gender='" + Gender + "',Sports='" + Sports + "',PlayLevel='" + PlayLevel + "',PaymentMethod='" + PaymentMethod + "',VenmoId='" + VenmoId + "',PaypalId='" + PaypalId + "',GamesPerSeason='" + GamesPerSeason + "',Day='" + Day + "',PlayersPerTeamMax='" + PlayersPerTeamMax + "',PlayerAge='" + PlayerAge + "',Season='" + Season + "',image='" + image + "',LeagueStartDate='" + LeagueStartDate + "',LeagueEndDate='" + LeagueEndDate + "',RegistrationDeadline='" + RegistrationDeadline + "',RoasterSubmissionDeadline='" + RoasterSubmissionDeadline + "',StartTime=REPLACE(REPLACE('" + StartTime + "', 'pm', ''), 'am', ''),EndTime=REPLACE(REPLACE('" + EndTime + "', 'pm', ''), 'am', ''),LeagueFee='" + LeagueFee + "' where LeagueId="+LeagueId;
         //  db.query(query, function (err, results) {
            var query = "Update leagues set LeagueName=?,WhoWeAre=?,CaptainsName=?,City=?,State=?,Gender=?,Sports=?,PlayLevel=?,PaymentMethod=?,VenmoId=?,PaypalId=?,GamesPerSeason=?,Day=?,PlayersPerTeamMax=?,PlayerAge=?,Season=?,image=?,LeagueStartDate=?,LeagueEndDate=?,RegistrationDeadline=?,RoasterSubmissionDeadline=?,StartTime=REPLACE(REPLACE('" + StartTime + "', 'pm', ''), 'am', ''),EndTime=REPLACE(REPLACE('" + EndTime + "', 'pm', ''), 'am', ''),LeagueFee=?,Message=? where LeagueId=?";
            db.query(query,[LeagueName,whoeweare,CaptainsName,City,State,Gender,Sports,PlayLevel,PaymentMethod,VenmoId,PaypalId,GamesPerSeason,Day,PlayersPerTeamMax,PlayerAge,Season,image,LeagueStartDate,LeagueEndDate,RegistrationDeadline,RoasterSubmissionDeadline,LeagueFee,Message,LeagueId], function (err, results) {
          
              if (err)
              {
                CloseDbConnection(db);
              return res.status(500).send({ message: 'Error' });
              }
            });
       
            CloseDbConnection(db);
            return res.status(200).send({ message: 'Success' });
          }else
          {
            CloseDbConnection(db);
          return res.status(200).send({ message: 'League Name Already Exisit' });
          }
        });




      }else
      {



      db.query("SELECT * FROM leagues Where LeagueName='" + req.body.LeagueName + "'", function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }
        if (!results || results.length == 0) {
 
        //  var query = "insert into leagues (LeagueName,WhoWeAre,CaptainsName,City,State,Gender,Sports,PlayLevel,PaymentMethod,VenmoId,PaypalId,GamesPerSeason,Day,PlayersPerTeamMax,PlayerAge,Season,image,LeagueStartDate,LeagueEndDate,RegistrationDeadline,RoasterSubmissionDeadline,StartTime,EndTime,LeagueFee,CreatedBy)VALUES  ('" + LeagueName + "','" + whoeweare + "','" + CaptainsName + "','" + City + "','" + State + "','" + Gender + "','" + Sports + "','" + PlayLevel + "','" + PaymentMethod + "','" + VenmoId + "','" + PaypalId + "','" + GamesPerSeason + "', '" + Day + "','" + PlayersPerTeamMax + "','" + PlayerAge + "','" + Season + "','" + image + "','" + LeagueStartDate + "','" + LeagueEndDate + "','" + RegistrationDeadline + "','" + RoasterSubmissionDeadline + "',REPLACE(REPLACE('" + StartTime + "', 'pm', ''), 'am', ''),REPLACE(REPLACE('" + EndTime + "', 'pm', ''), 'am', ''),'" + LeagueFee + "'," + CreatedBy + ")";
        //  db.query(query, function (err, result1) {
            var query = "insert into leagues (LeagueName,WhoWeAre,CaptainsName,City,State,Gender,Sports,PlayLevel,PaymentMethod,VenmoId,PaypalId,GamesPerSeason,Day,PlayersPerTeamMax,PlayerAge,Season,image,LeagueStartDate,LeagueEndDate,RegistrationDeadline,RoasterSubmissionDeadline,StartTime,EndTime,LeagueFee,Message,CreatedBy)VALUES  (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,REPLACE(REPLACE('" + StartTime + "', 'pm', ''), 'am', ''),REPLACE(REPLACE('" + EndTime + "', 'pm', ''), 'am', ''),?,?,?)";
            db.query(query,[LeagueName,whoeweare ,CaptainsName,City,State,Gender,Sports,PlayLevel,PaymentMethod,VenmoId,PaypalId,GamesPerSeason,Day,PlayersPerTeamMax,PlayerAge,Season,image,LeagueStartDate,LeagueEndDate,RegistrationDeadline,RoasterSubmissionDeadline,LeagueFee,Message,CreatedBy], function (err, result1) {
            if (err) 
            {
              console.log('Error2 ',err);
              CloseDbConnection(db);
            return res.status(500).send({ message: 'Error' });
            }


  //.. new stuff
  if (result1 && result1.insertId) {
    let grptype = 'Leagues';
  //  var query = "insert into sportsbox.groups (GroupName,GroupType,IsDirectChat,CreatedBy)  VALUES  ('" + LeagueName + "','" + grptype + "',0," + CreatedBy + ")";
  //  db.query(query, function (err, result) {
      var query = "insert into sportsbox.groups (GroupName,GroupType,IsDirectChat,CreatedBy)  VALUES  (?,?,?,?)";
    db.query(query,[LeagueName,grptype,0,CreatedBy], function (err, result) {
    
      if (err) 
      {
        CloseDbConnection(db);
      return res.status(500).send({ message: 'Error' });
      }
      //.. new stuff
      if (result && result.insertId) {
        let grptype = 'Teams';
          var query1 = "insert into groupusers (UserId,GroupId)  VALUES  (" + CreatedBy + "," + result.insertId + ")";
        db.query(query1, function (err, result2) {
      
          if (err)
          {
            CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
          }
        });

        var query2 = "insert into chatmessages (GroupId,MessageDescription,CreatedBy)  VALUES  (" + result.insertId + ",'Welcome to League Group'," + CreatedBy + ")";
        db.query(query2, function (err, result) {
          if (err) 
          {
            CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
          }
        });
        var query3 = 'Update leagues set GroupChatId=' + result.insertId + ' where LeagueId=' + result1.insertId;
        db.query(query3, function (err, result) {
          if (err) 
          {
            CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
          }
        });
        CloseDbConnection(db);
        return res.status(200).send({ message: 'Success' });
      }
      //...new stuff
    });
  }else
  {
    CloseDbConnection(db);
    return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
  //...new stuff






          });
        
        }else
        {
          CloseDbConnection(db);
        return res.status(200).send({ message: 'League Name Already Exisit' });
        }
      });




    }






    });
  } catch (err) {

    next();
    CloseDbConnection(db);
    console.log('exception: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});

router.post('/DeleteLeague', function (req, res, next) {
  try {   
    connectDb(function (Error, response) {
      if (Error) {
      return  res.status(500).send('Unabe to Connect to Database');
      }  
      let LeagueId =0;
      if(req.body.LeagueID)
      {
        LeagueId= parseInt(req.body.LeagueID);
      }        
      db = response;
  if(LeagueId!=0 )
 {

  db.query('SELECT count(*) as numRows FROM leagues where LeagueId='+LeagueId, function (error, results, fields) {

      if (error)
      {
        CloseDbConnection(db);
      return res.status(500).send('Error on the server.');
      }
      if (results && results[0] && results[0].numRows){


              
   var query = 'Update leagues set IsDeleted=true where LeagueId='+LeagueId;
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
          res.status(200).send({message:'No Data Found!'});
      }
  }); 





 }else 
{
  CloseDbConnection(db);
return res.status(200).send({ message: 'LeagueId is missing' });
}
});
} catch (err) {
  next();
  CloseDbConnection(db);
  console.log('exception: ',err);
 return res.status(500).send({ message: 'Error Occurred: ' + err });
}
});


router.post('/joinedteamslist', function (req, res, next) {

  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      var leagueId = 0;
      leagueId = parseInt(req.body.leagueid);
      let IsApproved='Accepted';
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM joinedteamsinleague where IsApproved="'+IsApproved+'" and LeagueId=' + leagueId, function (error, results, fields) {
     
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }
        

        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
          db.query('SELECT tm.TeamId, tm.TeamName,tm.City,tm.State,tm.image,sp.Name as Sports FROM joinedteamsinleague as jtl left join teams as tm on tm.TeamId=jtl.TeamId left join sports as sp on tm.Sports=sp.SportId where jtl.IsApproved="'+IsApproved+'" and jtl.LeagueId="' + leagueId + '" Order by LeagueId Desc LIMIT ' + limit, function (error1, results1, fields) {
           
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
         return res.status(200).send({ message: "" });
      
        }
      });


    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});

router.post('/Gamelocationslist', function (req, res, next) {

  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      var leagueId = 0;
      leagueId = parseInt(req.body.leagueid);
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM gamelocations where IsDeleted=false and LeagueId=' + leagueId, function (error, results, fields) {

        if (error) 
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }


        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
          db.query('SELECT * from gamelocations where IsDeleted=false and LeagueId="' + leagueId + '" Order by GameLocationId Desc LIMIT ' + limit, function (error1, results1, fields) {
      
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
          res.status(200).send({ message: "No Data Found" });
      
        }
      });


    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});

router.post('/LeagueRuleslist', function (req, res, next) {

  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      var leagueId = 0;
      leagueId = parseInt(req.body.leagueid);
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM leaguerules where IsDeleted=false and LeagueId=' + leagueId, function (error, results, fields) {

        if (error) 
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }

        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
          db.query('SELECT * from leaguerules where IsDeleted=false and LeagueId="' + leagueId + '" Order by RuleId Desc LIMIT ' + limit, function (error1, results1, fields) {
    
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
         return res.status(200).send({ message: "No Data Found" });

        }
      });


    } catch (err) {
      CloseDbConnection(db);
      console.log('exception ',err);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});

router.post('/LeagueDivisionslist', function (req, res, next) {

  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      var leagueId = 0;
      leagueId = parseInt(req.body.leagueid);
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM divisions where IsDeleted=false and LeagueId=' + leagueId, function (error, results, fields) {
    
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server "+error });
        }
 

        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
          db.query('SELECT * from divisions where IsDeleted=false and LeagueId="' + leagueId + '" Order by DivisionId Desc LIMIT ' + limit, function (error1, results1, fields) {
      
            if (error1)
            {
              CloseDbConnection(db);
            return res.status(500).send({ message: "Error on the server."+error });
            }
            CloseDbConnection(db);
          return  res.status(200).send(new ResponeModel(numPages, page, results1));
          });
        }
        else {
          CloseDbConnection(db);
        return  res.status(200).send({ message: "No Data Found" });
       
        }
      });


    } catch (err) {
      CloseDbConnection(db);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});

router.post('/LeagueTeamsRequestlist', function (req, res, next) {

  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      var leagueId = 0;
      leagueId = parseInt(req.body.leagueid);
      let pending='Pending';
      let rejected='Rejected'
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM joinedteamsinleague where (IsApproved="'+pending+'" ||IsApproved="'+rejected+'") and LeagueId=' + leagueId, function (error, results, fields) {
      
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }
    

        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
          db.query('SELECT jtl.* ,tm.TeamName,tm.image,sp.Name as Sport FROM joinedteamsinleague as jtl left join teams tm on jtl.TeamId=tm.TeamId left join sports as sp on tm.Sports=sp.SportId where (IsApproved="'+pending+'" ||IsApproved="'+rejected+'") and jtl.LeagueId="' + leagueId + '" Order by jtl.TeamId Desc LIMIT ' + limit, function (error1, results1, fields) {
     
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
         return res.status(200).send({ message: "No Data Found" });
     
        }
      });


    } catch (err) {
      CloseDbConnection(db);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});

router.post('/ManageLeagueRules', function (req, res, next) {
  connectDb(async function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });

    try {
      let leagueId = 0;
      let RuleId = 0;
      if (!isNaN(req.body.leagueid)) {
        leagueId = parseInt(req.body.leagueid);
      }
      if (!isNaN(req.body.ruleid)) {
        RuleId = parseInt(req.body.ruleid);
      }
      db = response;
   

      if (leagueId != 0) {
            db.query('SELECT * FROM leaguerules where LeagueId="'+leagueId+'" AND RuleId='+RuleId , function (error1, results, fields) {
         
              if (error1) 
              {
                CloseDbConnection(db);
              return res.status(500).send({ message: 'Error on the server.' });
              }
              if (results)
              {
                CloseDbConnection(db);
             return res.status(200).send(results);
              }
            else
            {
              CloseDbConnection(db);
           return res.status(200).send('');
            }
            });
      }else
      {
        CloseDbConnection(db);
        return res.status(500).send({ message: 'No Data Found.' });
      } 

    }catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});


router.post('/SaveLeagueRule', function (req, res, next) {
  try {

    if (!req.body.Description || req.body.Description == "" || req.body.Description == '') {
   return   res.status(500).send({ message: 'Description is missing!' });
    }

    connectDb(function (Error, response) {
      if (Error) {
   
      return  res.status(500).send({message:'Unabe to Connect to Database'});
      }
      db = response;
      db.query("SELECT * FROM leagues Where LeagueId='" + req.body.LeagueID + "'", function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }
        var Description = (req.body.Description ? req.body.Description : "");
        var LeagueId = req.body.LeagueID;
        var RuleID = req.body.RuleID;
        var CreatedDate = new Date();
        var DeletedBit = 0;
        if (!results || results.length == 0) {
          CloseDbConnection(db);
          return res.status(200).send({ message: 'League Does Not Exisit' });
        } else {
            if(RuleID)
           {
            // var query = 'Update leaguerules set Description ="' + Description + '" where RuleId=' + RuleID;
           //  db.query(query, function (err, results) {
              var query = 'Update leaguerules set Description =? where RuleId=?';
              db.query(query,[Description,RuleID], function (err, results) {
               if (err) 
               {
                CloseDbConnection(db);
              return res.status(500).send({ message: 'Error' });
               }
             });
             CloseDbConnection(db);
             return res.status(200).send({ message: 'Success' });
           }else 
          {
          //  var query = "insert into leaguerules (Description,LeagueId,IsDeleted)VALUES  ('" + Description + "','" + LeagueId + "'," + DeletedBit + ")";
          //  db.query(query, function (err, results) {
              var query = "insert into leaguerules (Description,LeagueId,IsDeleted)VALUES  (?,?,?)";
              db.query(query,[Description,LeagueId,DeletedBit], function (err, results) {
              if (err)
              {
                CloseDbConnection(db);
                return res.status(500).send({ message: 'Error' });
              }
            });

          }
          CloseDbConnection(db);
          return res.status(200).send({ message: 'Success' });
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


router.post('/DeleteLeagueRule', function (req, res, next) {
  try {


    connectDb(function (Error, response) {
      if (Error) {
   
      return  res.status(500).send({message:'Unabe to Connect to Database'});
      }
      var league_Id = 0;
      let RuleId = 0;
      if (!isNaN(req.body.leagueid)) {
        league_Id = parseInt(req.body.leagueid);
      }
      if (!isNaN(req.body.RuleId)) {
        RuleId = parseInt(req.body.RuleId);
      }
      
      db = response;
      db.query("SELECT * FROM leaguerules Where RuleId="+RuleId+" and LeagueId=" + league_Id + "", function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }
        if (!results && results.length == 0) {
          CloseDbConnection(db);
          return res.status(200).send({ message: 'League Rule Does Not Exisit' });
        } else {
             var query = 'Update leaguerules set IsDeleted=true where RuleId=' + RuleId;
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

      });
    });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});

router.post('/DeleteDivision', function (req, res, next) {
  try {

    connectDb(function (Error, response) {
      if (Error) {
 
        return  res.status(500).send({message: 'Unabe to Connect to Database'});
      }

      var league_Id = 0;
      let DvisionId = 0;
      if (!isNaN(req.body.leagueid)) {
        league_Id = parseInt(req.body.leagueid);
      }
      if (!isNaN(req.body.DivisionId)) {
        DvisionId = parseInt(req.body.DivisionId);
      }
      db = response;

      db.query("SELECT * FROM divisions Where DivisionId="+DvisionId+" and LeagueId='" + league_Id + "'", function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }

        if (!results && results.length == 0) {
          CloseDbConnection(db);
          return res.status(200).send({ message: 'Division Does Not Exisit' });
        } else {

             var query = "Update divisions set IsDeleted=true where DivisionId=" + DvisionId + "";
             db.query(query, function (err, results) {
            
               if (err)
               {
                CloseDbConnection(db);
             return  res.status(500).send({ message: 'Error' });
               }
             });
             CloseDbConnection(db);
             return res.status(200).send({ message: 'Success' });
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


router.post('/DeleteSchedule', function (req, res, next) {
  try {


    connectDb(function (Error, response) {
      if (Error) {
       
      return  res.status(500).send({ message: 'Unabe to Connect to Database' });
      }

     var league_Id = 0;
      var scheduleId = 0;
      if (!isNaN(req.body.leagueid)) {
        league_Id = parseInt(req.body.leagueid);
      }
      if (!isNaN(req.body.GameScheduleId)) {
        scheduleId = parseInt(req.body.GameScheduleId);
      }
      db = response;

      db.query("SELECT * FROM gameschedule Where GameScheduleId="+scheduleId+" and LeagueId='" + league_Id + "'", function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }
        if (!results && results.length == 0) {
          CloseDbConnection(db);
          return res.status(200).send({ message: 'Schedule Does Not Exisit' });
        } else {


              var query = "Update gameschedule set IsDeleted =true where GameScheduleId=" + scheduleId + "";
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

      });
    });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});


router.post('/ManageGameLocations', function (req, res, next) {
  connectDb(async function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    try {
      let LeagueId = 0;
      let LocationId = 0;
      if (!isNaN(req.body.leagueid)) {
        LeagueId = parseInt(req.body.leagueid);
      }
      if (!isNaN(req.body.locationid)) {
        LocationId = parseInt(req.body.locationid);
      }
      db = response;
 

      if (LeagueId != 0 && LocationId!=0) {
            db.query('SELECT * FROM gamelocations where LeagueId="'+LeagueId+'" AND GameLocationId='+LocationId , function (error1, results, fields) {
            
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
           return res.status(200).send({message:'No Data Found'});
            }
            });
      }else
      {
        CloseDbConnection(db);
        return res.status(500).send({ message: 'No Data Found!.' });
      } 

    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});



router.post('/SaveGameLocations', function (req, res, next) {
  try {

    if (!req.body.LocationName || req.body.LocationName == "" || req.body.LocationName == '') {
    return  res.status(500).send({ message: 'LocationName is missing!' });
    }
    if (!req.body.Description || req.body.Description == "" || req.body.Description == '') {
      return  res.status(500).send({ message: 'Description is missing!' });
    }
    if (!req.body.Address1 || req.body.Address1 == "" || req.body.Address1 == '') {
      return  res.status(500).send({ message: 'Address1 is missing!' });
    }
   /*  if (!req.body.Address2 || req.body.Address2 == "" || req.body.Address2 == '') {
      return  res.status(500).send({ message: 'Address2 is missing!' });
    } */
    if (!req.body.City || req.body.City == "" || req.body.City == '') {
      return  res.status(500).send({ message: 'City is missing!' });
    }
    if (!req.body.State || req.body.State == "" || req.body.State == '') {
      return  res.status(500).send({ message: 'State is missing!' });
    }
    if (!req.body.PostalCode || req.body.PostalCode == "" || req.body.PostalCode == '') {
      return  res.status(500).send({ message: 'PostalCode is missing!' });
    }

    connectDb(function (Error, response) {
      if (Error) {
 
        return  res.status(500).send({message:'Unabe to Connect to Database'});
      }
      var league_Id = 0;
      let LocationId = 0;
      if (!isNaN(req.body.LeagueID)) {
        league_Id = parseInt(req.body.LeagueID);
      }
      if (!isNaN(req.body.locationid)) {
        LocationId = parseInt(req.body.locationid);
      }
      db = response;

      db.query("SELECT * FROM leagues Where LeagueId='" + league_Id + "'", function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }
        var LocationName = (req.body.LocationName ? req.body.LocationName : "");
        var Description = req.body.Description;
        var Address1 = req.body.Address1;
        var Address2 = req.body.Address2;
        var City = req.body.City;
        var State = req.body.State;
        var PostalCode = req.body.PostalCode;
        var LeagueId = req.body.LeagueID;
        var CreatedDate = new Date();
        var DeletedBit = 0;
        if (!results || results.length == 0) {
          CloseDbConnection(db);
          return res.status(200).send({ message: 'League Does Not Exisit' });
        } else {
            if(LocationId!=0)
           {
           //   var query = "Update gamelocations set LocationName ='" + LocationName + "',Description ='" + Description + "',Address1 ='" + Address1 + "',Address2 ='" + Address2 + "',City ='" + City + "',State ='" + State + "',PostalCode ='" + PostalCode + "' where GameLocationId=" + LocationId + "";
           //     db.query(query, function (err, results) {
                  var query = "Update gamelocations set LocationName =?,Description =?,Address1 =?,Address2 =?,City =?,State =?,PostalCode =? where GameLocationId=?";
                db.query(query,[LocationName,Description,Address1,Address2,City,State,PostalCode,LocationId], function (err, results) {
                  console.log('err ',err);
              if (err)
              {
                CloseDbConnection(db);
                return res.status(500).send({ message: 'Error' });
              }
            });

           }else
          {
          //  var query = "insert into gamelocations (LocationName,Description,Address1,Address2,City,State,PostalCode,LeagueId,IsDeleted)VALUES  ('" + LocationName + "','" + Description + "','" + Address1 + "','" + Address2 + "','" + City + "','" + State + "','" + PostalCode + "','" + LeagueId + "'," + DeletedBit + ")";
         //   db.query(query, function (err, results) {
              var query = "insert into gamelocations (LocationName,Description,Address1,Address2,City,State,PostalCode,LeagueId,IsDeleted)VALUES  (?,?,?,?,?,?,?,?,?)";
              db.query(query,[LocationName,Description,Address1,Address2,City,State,PostalCode,LeagueId,DeletedBit], function (err, results) {
              console.log('err ',err);
              if (err)
              {
                CloseDbConnection(db);
                return res.status(500).send({ message: 'Error' });
              }
            });

          }
          CloseDbConnection(db);
          return res.status(200).send({ message: 'Success' });
        }

      });
    });
  } catch (err) {
    CloseDbConnection(db);
  console.log('exception ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});


router.post('/DeleteGameLocation', function (req, res, next) {
  try {

    connectDb(function (Error, response) {
      if (Error) {
 
        return  res.status(500).send({message:'Unabe to Connect to Database'});
      }
      var league_Id = 0;
      let LocationId = 0;
      if (!isNaN(req.body.leagueid)) {
        league_Id = parseInt(req.body.leagueid);
      }
      if (!isNaN(req.body.locationid)) {
        LocationId = parseInt(req.body.locationid);
      }
      db = response;
      db.query("SELECT * FROM gamelocations Where GameLocationId="+LocationId+" and LeagueId=" + league_Id + "", function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }
        if (!results && results.length == 0) {
          CloseDbConnection(db);
          return res.status(200).send({ message: 'Location Does Not Exisit' });
        } else {
              var query = "Update gamelocations set IsDeleted =true where GameLocationId=" + LocationId + "";
                db.query(query, function (err, results) {
              if (err)
              {
                CloseDbConnection(db);
                return res.status(500).send({ message: 'Error' });
              }
              CloseDbConnection(db);
              return res.status(200).send({ message: 'Success' });
                
            });
         
        }

      });
    });
  } catch (err) {
    CloseDbConnection(db);
  console.log('err ',err);
   return res.status(500).send({ message: 'Error Occurred: ' });
  }
});


router.post('/SaveDivisions', function (req, res, next) {
  try {

    if (!req.body.DivisionName || req.body.DivisionName == "" || req.body.DivisionName == '') {
      return  res.status(500).send({ message: 'DivisionName is missing!' });
    }
    if (!req.body.Description || req.body.Description == "" || req.body.Description == '') {
      return  res.status(500).send({ message: 'Description is missing!' });
    }
console.log('body ',req.body);
    connectDb(function (Error, response) {
      if (Error) {
        console.log('err 8 ',Error);
        return  res.status(500).send({message: 'Unabe to Connect to Database'});
      }
      let league_Id = 0;
      let Division_Id = 0;
      if(!isNaN(req.body.LeagueID))
      {
      league_Id = parseInt(req.body.LeagueID);
      }
      if(!isNaN(req.body.DivisionID))
      {
        Division_Id = parseInt(req.body.DivisionID);
      }
      db = response;

      db.query("SELECT * FROM leagues Where LeagueId='" + league_Id + "'", function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }
        var DivisionName = (req.body.DivisionName ? req.body.DivisionName : "");
        var Description = req.body.Description;
        var LeagueId = req.body.LeagueID;
        let SelectedTeams = req.body.SelectedTeams?req.body.SelectedTeams:[] ;
        console.log('SelectedTeams ',SelectedTeams);
        console.log('req.body.SelectedTeams ',req.body.SelectedTeams);
        if (!results || results.length == 0) {
          CloseDbConnection(db);
          return res.status(200).send({ message: 'League Does Not Exisit' });
        } else {
            if(Division_Id !=0)
           {
           //  var query = "Update divisions set Name ='" + DivisionName + "' , Description ='" + Description + "' where DivisionId=" + Division_Id + "";
           //  db.query(query, function (err, result1) {
              var query = "Update divisions set Name =?, Description =? where DivisionId=?";
              db.query(query,[DivisionName,Description,Division_Id], function (err, result1) {
            
               if (err) 
               {
                console.log('err 7 ',err);
                 CloseDbConnection(db);
              return res.status(500).send({ message: 'Error' });
               }

               if(result1)
               {
   
   
   //inner table queries
   
   if(SelectedTeams && SelectedTeams!=null && SelectedTeams.length!=0)
   {
     SelectedTeams.map((currentValue, index) => {    
   
      db.query("SELECT * FROM joinedteamsindivision Where DivisionId=" + Division_Id+" and TeamId="+ currentValue.value, function (error1, result2, fields) {
        if (error1) {
          console.log('err 7 ',error1);
       //   CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }
        if (result2 && result2.length != 0) {
        //  var query = "Update joinedteamsindivision set Status="+currentValue.status+" Where DivisionId=" + Division_Id+" and TeamId="+ currentValue.value+"";  
       //   db.query(query, function (err, results) {
            var query = "Update joinedteamsindivision set Status=? Where DivisionId=? and TeamId=?";  
            db.query(query,[currentValue.status,Division_Id,currentValue.value], function (err, results) {
            if (err)
            {
              console.log('err 6 ',err);
         //     CloseDbConnection(db);
              return res.status(500).send({ message: 'Error' });
            }
          }); 
        }else
        {
     //  var query = "insert into joinedteamsindivision (DivisionId,TeamId,Status)  VALUES  (" + Division_Id + "," + currentValue.value + ","+currentValue.status+")";
    //   db.query(query, function (err, results) {
        var query = "insert into joinedteamsindivision (DivisionId,TeamId,Status)  VALUES  (?,?,?)";
        db.query(query,[Division_Id,currentValue.value,currentValue.status], function (err, results) {
   
         if (err)
         {
          console.log('err 5 ',err);
       //   CloseDbConnection(db);
           return res.status(500).send({ message: 'Error' });
         }

         CloseDbConnection(db);
         return res.status(200).send({ message: 'Success' });

       }); 
                                             
      }
   
     });
   });
   }else
   {

    var query = "Update joinedteamsindivision set Status=false Where DivisionId=" + Division_Id+"";  
    db.query(query, function (err, results) {
      if (err)
      {
        console.log('err 7 ',err);
   //     CloseDbConnection(db);
        return res.status(500).send({ message: 'Error' });
      }
      CloseDbConnection(db);
         return res.status(200).send({ message: 'Success' });
    }); 

   }
   //inner table queries
   
   
   
   
               }




             });

            


           //  return res.status(200).send({ message: 'Success' });
           }else 
          {
         //   var query = "insert into divisions (Name,Description,LeagueId)VALUES  ('" + DivisionName + "','" + Description + "'," + LeagueId + ")";
         //   db.query(query, function (err, result1) {
              var query = "insert into divisions (Name,Description,LeagueId)VALUES  (?,?,?)";
              db.query(query,[DivisionName,Description,LeagueId], function (err, result1) {
              if (err)
              {
                console.log('err 4 ',err);
                CloseDbConnection(db);
                return res.status(500).send({ message: 'Error' });
              }



              if(result1 && result1.insertId)
              {
  
  
  //inner table queries
  
  if(SelectedTeams && SelectedTeams!=null && SelectedTeams.length!=0)
  {
    SelectedTeams.map((currentValue, index) => {    
  
     db.query("SELECT * FROM joinedteamsindivision Where DivisionId=" + result1.insertId +" and TeamId="+ currentValue.value, function (error1, result2, fields) {
      if (error1) {
      //   CloseDbConnection(db);
      console.log('err 3 ',error1);
         return res.status(500).send({ message: 'Error' });
       }
       if (result2 && result2.length != 0) {
         var query = "Update joinedteamsindivision set Status="+currentValue.status+" Where DivisionId=" + result1.insertId +" and TeamId="+ currentValue.value+"";  
         db.query(query, function (err, results) {
  
           if (err)
           {
        //     CloseDbConnection(db);
        console.log('err 2 ',err);
             return res.status(500).send({ message: 'Error' });
           }
         }); 
       }else
       {
      var query = "insert into joinedteamsindivision (DivisionId,TeamId,Status)  VALUES  (" + result1.insertId + "," + currentValue.value + ","+currentValue.status+")";
      db.query(query, function (err, results) {
  
        if (err)
        {
      //   CloseDbConnection(db);
      console.log('err 1 ',err);
          return res.status(500).send({ message: 'Error' });
        }

        CloseDbConnection(db);
        return res.status(200).send({ message: 'Success' });

      }); 
                                            
     }
  
    });
  });
  }else
  {
    CloseDbConnection(db);
    return res.status(200).send({ message: 'Success' });

  }
  //inner table queries
  
  
  
  
              }



            });

          }
      //    CloseDbConnection(db);
      //    return res.status(200).send({ message: 'Success' });
        }

      });
    });
  } catch (err) {
    CloseDbConnection(db);
    console.log('exception: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});

let Gamelocationslist = []; let Divisionslist = []; let GameOfficialslist = []; let Teamslist = []; let GameScheduleInfoObject = [];
router.post('/ManageGameSchedule', function (req, res, next) {
  connectDb(async function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });



    try {
      var leagueId = 0;
      var scheduleId = 0;
      if (!isNaN(req.body.leagueid)) {
        leagueId = parseInt(req.body.leagueid);
      }
      if (!isNaN(req.body.ScheduleID)) {
        scheduleId = parseInt(req.body.ScheduleID);
      }
      db = response;

      if (leagueId != 0) {
        await LoadGameScheduleData(leagueId,scheduleId, function (results, error1) {
          CloseDbConnection(db);
        return  res.status(200).send(results);
        })

      }


    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
    return  res.status(500).send({ message: 'Error Occurred:' });
    }


  });
});

async function LoadGameScheduleData(leagueId,scheduleId, callback) {
  let promises = [];
if(scheduleId!=0)
{ 
  promises.push(GetLeagueDetails('SELECT * FROM gameschedule where LeagueId="'+leagueId+'" AND GameScheduleId='+ scheduleId, 'GameScheduleInfoObject', db));
  promises.push(GetLeagueDetails('SELECT * FROM gamelocations where leagueid=' + leagueId, 'Gamelocationslist', db));
promises.push(GetLeagueDetails('SELECT * FROM divisions where leagueid=' + leagueId, 'Divisionslist', db));
promises.push(GetLeagueDetails('SELECT * FROM joinedteamsinleague as jtl left join teams tm on tm.TeamId=jtl.TeamId where jtl.LeagueId=' + leagueId, 'Teamslist', db));
promises.push(GetLeagueDetails('SELECT * FROM users us where us.Role!=2', 'GameOfficialslist', db));
  
}else
{
  promises.push(GetLeagueDetails('SELECT * FROM gamelocations where leagueid=' + leagueId, 'Gamelocationslist', db));
  promises.push(GetLeagueDetails('SELECT * FROM divisions where leagueid=' + leagueId, 'Divisionslist', db));
  promises.push(GetLeagueDetails('SELECT * FROM joinedteamsinleague as jtl left join teams tm on tm.TeamId=jtl.TeamId where jtl.LeagueId=' + leagueId, 'Teamslist', db));
  promises.push(GetLeagueDetails('SELECT * FROM users us where us.Role!=2', 'GameOfficialslist', db));
}
  await Promise.all(promises);
  var objModel = new ManageGameScheduleModel();
  objModel.GameScheduleData=GameScheduleInfoObject;
  objModel.GameLocationsList = Gamelocationslist;
  objModel.DivisionsList = Divisionslist;
  objModel.TeamsList = Teamslist;
  objModel.GameOfficialsList = GameOfficialslist;
  await callback(objModel);
  // await callback(Gamelocationslist);
};

async function GetLeagueDetails(query, type, db) {
  try {

    return new Promise(function (resolve, reject) {

      db.query(query, function (error, results, fields) {
        //if (error1) return res.status(500).send({ message:'Error on the server.'});
        if (error) {
          console.log('error occ ',error);
          reject(new Error('Ooops, something broke!'));
        } else {
          //  list = results;
          if (type == 'GameScheduleInfoObject')
          GameScheduleInfoObject = results;
          if (type == 'Gamelocationslist')
            Gamelocationslist = results;
          if (type == 'Divisionslist')
            Divisionslist = results;
          if (type == 'Teamslist')
            Teamslist = results;
          if (type == 'GameOfficialslist')
            GameOfficialslist = results;

          resolve(results);
        }
      });

    });

  } catch (error) {
  }
};








let DivisionInfo = []; let JoinedTeamslist = []; let SelectedTeamslist = []; 
router.post('/ManageDivision', function (req, res, next) {
  connectDb(async function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });

     DivisionInfo = [];  JoinedTeamslist = [];  SelectedTeamslist = []; 
    try {
      var leagueId = 0;
      var DivisionId = 0;
      if (!isNaN(req.body.leagueid)) {
        leagueId = parseInt(req.body.leagueid);
      }
      if (!isNaN(req.body.DivisionID)) {
        DivisionId = parseInt(req.body.DivisionID);
      }
      db = response;

      if (leagueId != 0) {
        await LoadDivisionData(leagueId,DivisionId, function (results, error1) {
          CloseDbConnection(db);
          console.log('res in div api = ',results);
        return  res.status(200).send(results);
        })

      }


    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' });
    }


  });
});

async function LoadDivisionData(leagueId,DivisionId, callback) {
  let promises = [];
  let IsApprovedStatus='Accepted';
  console.log('leagueId 1 ',leagueId);
  console.log('DivisionId 1 ',DivisionId);
  if(DivisionId && DivisionId != 0)
  {
    console.log('leagueId ',leagueId);
    console.log('DivisionId ',DivisionId);
  promises.push(GetDivisionDetails('select * from divisions where LeagueId="'+leagueId+'" and DivisionId='+ DivisionId, 'DivisionInfo', db));
  promises.push(GetDivisionDetails('select jtl.*,tm.TeamName from joinedteamsindivision jtl left join teams tm on tm.TeamId=jtl.TeamId where DivisionId='+ DivisionId, 'SelectedTeamslist', db));
  }
  promises.push(GetDivisionDetails('select jtd.*,tm.TeamName from  joinedteamsinleague jtd left join teams tm on tm.TeamId=jtd.TeamId where LeagueId=' + leagueId +' and IsApproved="'+ IsApprovedStatus+'"','JoinedTeamslist', db));

  await Promise.all(promises);
  var objModel = new ManageDivisionModel();
  objModel.DivisionInfo=DivisionInfo;
  objModel.JoinedTeamList = JoinedTeamslist;
  objModel.SelectedTeamslist = SelectedTeamslist;
  await callback(objModel);
  // await callback(Gamelocationslist);
};

async function GetDivisionDetails(query, type, db) {
  try {

    return new Promise(function (resolve, reject) {

      db.query(query, function (error, results, fields) {
        if (error) {
          reject(new Error('Ooops, something broke! ' +error + query));
        } else {
          if (type == 'DivisionInfo')
          DivisionInfo = results;
          if (type == 'JoinedTeamslist')
          JoinedTeamslist = results;
          if (type == 'SelectedTeamslist')
          SelectedTeamslist = results;
          resolve(results);
        }
      });

    });

  } catch (error) {
  }
};











router.post('/SaveGameSchedule', function (req, res, next) {
  try {

    if (!req.body.Type || req.body.Type == "" || req.body.Type == '') {
      return  res.status(500).send({ message: 'Type is missing!' });
    }
    if (!req.body.Location || req.body.Location == "" || req.body.Location == '') {
      return  res.status(500).send({ message: 'Location is missing!' });
    }
    if (!req.body.Division || req.body.Division == "" || req.body.Division == '') {
      return  res.status(500).send({ message: 'Division is missing!' });
    }
    if (!req.body.HomeTeam || req.body.HomeTeam == "" || req.body.HomeTeam == '') {
      return  res.status(500).send({ message: 'HomeTeam is missing!' });
    }
    if (!req.body.AwayTeam || req.body.AwayTeam == "" || req.body.AwayTeam == '') {
      return res.status(500).send({ message: 'AwayTeam is missing!' });
    }
    if (!req.body.StartDate || req.body.StartDate == "" || req.body.StartDate == '') {
      return  res.status(500).send({ message: 'StartDate is missing!' });
    }
    if (!req.body.StartTime || req.body.StartTime == "" || req.body.StartTime == '') {
      return res.status(500).send({ message: 'StartTime is missing!' });
    }
    if (!req.body.EndTime || req.body.EndTime == "" || req.body.EndTime == '') {
      return  res.status(500).send({ message: 'EndTime is missing!' });
    }
    if (!req.body.GameOfficial || req.body.GameOfficial == "" || req.body.GameOfficial == '') {
      return  res.status(500).send({ message: 'GameOfficial is missing!' });
    }
    if (!req.body.GameNotes || req.body.GameNotes == "" || req.body.GameNotes == '') {
      return  res.status(500).send({ message: 'GameNotes is missing!' });
    }


    connectDb(function (Error, response) {
      if (Error) {
       
        res.status(500).send({ message: 'Unabe to Connect to Database' });
      }
      var league_Id = 0;
      var scheduleId = 0;
      if (!isNaN(req.body.LeagueID)) {
        league_Id = parseInt(req.body.LeagueID);
      }
      if (!isNaN(req.body.ScheduleID)) {
        scheduleId = parseInt(req.body.ScheduleID);
      }
      db = response;

      db.query("SELECT * FROM leagues Where LeagueId='" + league_Id + "'", function (error1, results, fields) {
        if (error1) {

          return res.status(500).send({ message: 'Error' });
        }
        var Type = (req.body.Type ? req.body.Type : "");
        var Location = req.body.Location;
        var Division = req.body.Division;
        var HomeTeam = (req.body.HomeTeam ? req.body.HomeTeam : "");
        var AwayTeam = req.body.AwayTeam;
        var StartDate = (req.body.StartDate ? new Date(req.body.StartDate) : "");
        var StartTime = req.body.StartTime;
        var EndTime = req.body.EndTime;
        var GameOfficial = req.body.GameOfficial;
        var GameNotes = req.body.GameNotes;
        var LeagueId = req.body.LeagueID;
        var CreatedDate = new Date();
        var DeletedBit = 0;
        if (!results || results.length == 0) {
          CloseDbConnection(db);
          return res.status(200).send({ message: 'League Does Not Exisit' });
        } else {


          
          var d = new Date(StartDate);
          var day = d.getDate()
          var monthIndex = d.getMonth();
          var year = d.getFullYear();

          var stDate = year +"-"+ (monthIndex+1) +"-"+ day;

            if(scheduleId!=0)
           {
           // CloseDbConnection(db);
          //  return res.status(200).send({ message: 'Need to write the Update Query' });


            var query = "Update gameschedule set AwayTeamId=?,HomeTeamId=?,DivisionId=?,StartTime=REPLACE(REPLACE('"+StartTime+"', 'pm', ''), 'am', ''),EndTime=REPLACE(REPLACE('"+EndTime+"', 'pm', ''), 'am', ''),StartDate=?,GameOfficialId=?,GameNotes=?,LocationId=?,GameTypeId=?,LeagueId=? Where GameScheduleId=?";;
            db.query(query,[AwayTeam,HomeTeam,Division,stDate,GameOfficial,GameNotes,Location,Type,LeagueId,scheduleId], function (err, result1) {
              if (err)
              {
                console.log('err ',err);
                CloseDbConnection(db);
                return res.status(500).send({ message: 'Error' });
              }
            }); 
           }else 
          {
           
      

         //   var query = "insert into gameschedule (AwayTeamId,HomeTeamId,DivisionId,StartTime,EndTime,StartDate,GameOfficialId,GameNotes,LocationId,GameTypeId,LeagueId,IsDeleted)VALUES  ('" + AwayTeam + "','" + HomeTeam + "','" + Division + "',REPLACE(REPLACE('"+StartTime+"', 'pm', ''), 'am', ''),REPLACE(REPLACE('"+EndTime+"', 'pm', ''), 'am', ''),'" + stDate + "','" + GameOfficial + "','" + GameNotes + "','" + Location + "','" + Type + "','" + LeagueId + "'," + DeletedBit + ")";
         //   db.query(query, function (err, results) {
              var query = "insert into gameschedule (AwayTeamId,HomeTeamId,DivisionId,StartTime,EndTime,StartDate,GameOfficialId,GameNotes,LocationId,GameTypeId,LeagueId,IsDeleted)VALUES  (?,?,?,REPLACE(REPLACE('"+StartTime+"', 'pm', ''), 'am', ''),REPLACE(REPLACE('"+EndTime+"', 'pm', ''), 'am', ''),?,?,?,?,?,?,?)";
              db.query(query,[AwayTeam,HomeTeam,Division,stDate,GameOfficial,GameNotes,Location,Type,LeagueId,DeletedBit], function (err, results) {
              if (err)
              {
                CloseDbConnection(db);
                return res.status(500).send({ message: 'Error' });
              }
            });

          }
          CloseDbConnection(db);
          return res.status(200).send({ message: 'Success' });
        }

      });
    });
  } catch (err) {
    CloseDbConnection(db);
    console.log('exception: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});

router.post('/LeagueGameScheduleslist', function (req, res, next) {

  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      var leagueId = 0;
      leagueId = parseInt(req.body.leagueid);
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM gameschedule where LeagueId=' + leagueId, function (error, results, fields) {

        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }

        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
          db.query('SELECT gm.*,atm.TeamName AwayTeamName,htm.TeamName as HomeTeamName,dv.Name as DivisionName,us.FirstName, us.LastName, gl.LocationName  FROM gameschedule gm left join teams as atm on gm.AwayTeamId=atm.TeamId left join teams as htm on gm.HomeTeamId=htm.TeamId left join divisions as dv on gm.DivisionId=dv.DivisionId left join users as us on gm.GameOfficialId=us.UserId left join gamelocations as gl on gm.LocationId=gl.GameLocationId where gm.LeagueId="' + leagueId + '" Order by gm.GameScheduleId Desc LIMIT ' + limit, function (error1, results1, fields) {

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
        return  res.status(200).send({ message: "No Data Found" });

        }
      });


    } catch (err) {
      CloseDbConnection(db);
      console.log('exception ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});


router.post('/ManageGameScore', function (req, res, next) {
  connectDb(async function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });

    try {
      var leagueId = 0;
      if (!isNaN(req.body.leagueid)) {
        leagueId = parseInt(req.body.leagueid);
      }
      var resultId = 0;
      if (!isNaN(req.body.Resultid)) {
        resultId = parseInt(req.body.Resultid);
      }
      db = response; var arr = [];
  
      if (leagueId != 0) {

        if(resultId!=0)
        {
          await db.query('SELECT gm.GameScheduleId, atm.TeamName AwayTeamName,atm.TeamId as AwayTeamId,htm.TeamName as HomeTeamName,htm.TeamId as HomeTeamId ,gmr.GameScheduleId ,gmr.TeamAScore,gmr.TeamBScore,gmr.WinnerTeam,gmr.IsDraw FROM gameschedule gm left join teams as atm on gm.AwayTeamId=atm.TeamId left join teams as htm on gm.HomeTeamId=htm.TeamId left join gamelocations as gl on gm.LocationId=gl.GameLocationId left join gameresults gmr on gmr.GameScheduleId=gm.GameScheduleId AND gmr.GameResultId="'+resultId+'" where gm.LeagueId='+ leagueId, function (error1, results, fields) {
      
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
          return  res.status(200).send('');
            }
            
          });
        }else
        {
  await db.query('SELECT gm.GameScheduleId, atm.TeamName AwayTeamName,atm.TeamId as AwayTeamId,htm.TeamName as HomeTeamName,htm.TeamId as HomeTeamId FROM gameschedule gm left join teams as atm on gm.AwayTeamId=atm.TeamId left join teams as htm on gm.HomeTeamId=htm.TeamId left join gamelocations as gl on gm.LocationId=gl.GameLocationId where gm.LeagueId='+ leagueId, function (error1, results, fields) {
      
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
            return  res.status(200).send('');
              }
              
            });
          }
      }

    } catch (err) {
      CloseDbConnection(db);
      console.log('exceprion: ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }



  });
});


router.post('/SaveGameScore', function (req, res, next) {
  try {

    if (!req.body.Game || req.body.Game == "" || req.body.Game == '') {
      return  res.status(500).send({ message: 'Game is missing!' });
    }
    if (!req.body.TeamA || req.body.TeamA == "" || req.body.TeamA == '') {
      return  res.status(500).send({ message: 'TeamA is missing!' });
    }
    if (!req.body.TeamB || req.body.TeamB == "" || req.body.TeamB == '') {
      return res.status(500).send({ message: 'TeamB is missing!' });
    }
   /*  if (!req.body.isDraw || req.body.isDraw == "" || req.body.isDraw == '') {
      res.status(500).send({ message: 'isDraw is missing!' });
    } */
    if (!req.body.WinnerTeam || req.body.WinnerTeam == "" || req.body.WinnerTeam == '') {
      return  res.status(500).send({ message: 'WinnerTeam is missing!' });
    }
    if (!req.body.TeamAScore || req.body.TeamAScore == "" || req.body.TeamAScore == '') {
      return  res.status(500).send({ message: 'TeamAScore is missing!' });
    }
    if (!req.body.TeamBScore || req.body.TeamBScore == "" || req.body.TeamBScore == '') {
      return  res.status(500).send({ message: 'TeamBScore is missing!' });
    }
   

    connectDb(function (Error, response) {
      if (Error) {

        return  res.status(500).send({ message: 'Unabe to Connect to Database' });
      }
      var league_Id = 0;
      if (!isNaN(req.body.LeagueID)) {
      league_Id = parseInt(req.body.LeagueID);
      }
      var resultId = 0;
      if (!isNaN(req.body.Resultid)) {
        resultId = parseInt(req.body.Resultid);
      }
      db = response;

      db.query("SELECT * FROM leagues Where LeagueId='" + league_Id + "'", function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }
        
        var Game = req.body.Game ;
        var TeamA = req.body.TeamA;
        var TeamB = req.body.TeamB;
        var isDraw =0;
        if(req.body.isDraw)
        {
        isDraw = req.body.isDraw==true?1:0;
        }
        var WinnerTeam = req.body.WinnerTeam;
        var TeamAScore = req.body.TeamAScore;
        var TeamBScore = req.body.TeamBScore;
 
        var CreatedDate = new Date();
        var DeletedBit = 0;
        if (!results || results.length == 0) {
          CloseDbConnection(db);
          return res.status(200).send({ message: 'League Does Not Exisit' });
        } else {
            if(resultId!=0)
           {
         //   CloseDbConnection(db);
         //   return res.status(200).send({ message: 'Needs To Write the Update Query' });

            var query = "Update gameresults set TeamA =?, TeamB =?,TeamAScore=?,TeamBScore=?,WinnerTeam=?,IsDraw=?,GameScheduleId=?,LeagueId=? where GameResultId=?";
            db.query(query,[TeamA,TeamB,TeamAScore,TeamBScore,WinnerTeam,isDraw,Game,league_Id,resultId], function (err, result){
              if (err)
              {
                CloseDbConnection(db);
                return res.status(500).send({ message: 'Error' });
              }
            });
           }else 
          {
            var query = "insert into gameresults (TeamA,TeamB,TeamAScore,TeamBScore,WinnerTeam,IsDraw,GameScheduleId,LeagueId,IsDeleted)VALUES  ('" + TeamA + "','" + TeamB + "','" + TeamAScore + "','" + TeamBScore + "','" + WinnerTeam + "'," + isDraw + ",'" + Game + "','" + league_Id + "'," + DeletedBit + ")";

            db.query(query, function (err, results) {
    
              if (err)
              {
                CloseDbConnection(db);
                return res.status(500).send({ message: 'Error' });
              }
            });

          }
          CloseDbConnection(db);
          return res.status(200).send({ message: 'Success' });
        }

      });
    });
  } catch (err) {
    CloseDbConnection(db);
    console.log('exception: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});


router.post('/DeleteScoreBoard', function (req, res, next) {
  try {

    

    connectDb(function (Error, response) {
      if (Error) {

        return  res.status(500).send({ message: 'Unabe to Connect to Database' });
      }
 
      var league_Id = 0;
      var resultId = 0;
      if (!isNaN(req.body.leagueid)) {
      league_Id = parseInt(req.body.leagueid);
      }     
      if (!isNaN(req.body.Resultid)) {
        resultId = parseInt(req.body.Resultid);
      }
      db = response;

      db.query("SELECT * FROM gameresults Where GameResultId="+resultId+" and LeagueId='" + league_Id + "'", function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }
        
        if (!results && results.length == 0) {
          CloseDbConnection(db);
          return res.status(200).send({ message: 'Result Does Not Exisit' });
        } else {


              var query = "Update gameresults set IsDeleted =true where GameResultId=" + resultId + "";
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

      });
    });
  } catch (err) {
    CloseDbConnection(db);
    console.log('exception: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});

router.post('/LeagueGameScoreslist', function (req, res, next) {

  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      var leagueId = 0;
      leagueId = parseInt(req.body.leagueid);
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM gameschedule where LeagueId=' + leagueId, function (error, results, fields) {

        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }
    

        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
          db.query('SELECT gr.GameResultId,gr.IsDraw,gs.StartDate as MatchDate,gr.TeamA as WinnerTeamID,gr.TeamB as RunnerTeamID,tA.TeamName as WinnerTeam,gr.TeamAScore as WinnerTeamScore,tB.TeamName as RunnerTeam,gr.TeamBScore as RunnerTeamScore ,dv.Name as DivisionName ,lg.CreatedBy as LeagueCreatorID FROM gameresults gr left join gameschedule gs on gr.GameScheduleId=gs.GameScheduleId left join divisions as dv on gs.DivisionId=dv.DivisionId left join teams tA on gr.TeamA=tA.TeamId left join teams tB on gr.TeamB=tB.TeamId  left join leagues lg on gr.LeagueId=lg.LeagueId where gr.LeagueId="' + leagueId + '" Order by gr.GameResultId Desc LIMIT ' + limit, function (error1, results1, fields) {
   
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
         return res.status(200).send({ message: "No Data Found" });
  
        }
      });


    }catch (err) {
      CloseDbConnection(db);
     return res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});


router.post('/OrderUniformTeamslist', function (req, res, next) {

  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    var numPerPage = parseInt(req.params.npp, 10) || 10;
    var page = parseInt(req.params.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {
      var leagueId = 0;
      leagueId = parseInt(req.body.leagueid);
      db = response; var arr = [];
      db.query('SELECT count(*) as numRows FROM orderuniform where LeagueId=' + leagueId, function (error, results, fields) {

        if (error) 
        {
          CloseDbConnection(db);
        return res.status(500).send({ message: "Error on the server." });
        }

        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);
          db.query('SELECT ou.OrderUniformId,ou.TeamId,tm.TeamName FROM orderuniform ou left join teams tm on tm.TeamId=ou.TeamId where ou.LeagueId="' + leagueId + '" Order by ou.OrderUniformId Desc LIMIT ' + limit, function (error1, results1, fields) {

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

router.post('/LeagueOrderUniformDetail', function (req, res, next) {

  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });
    try {
      var leagueId = 0;
      var teamId = 0;
      if(!isNaN(req.body.leagueid))
      {
      leagueId = parseInt(req.body.leagueid);
      }
      if(!isNaN(req.body.teamid))
      {
      teamId = parseInt(req.body.teamid);
      }
      db = response;
      
       db.query('SELECT ou.OrderUniformId,ou.TeamId,tm.TeamName,ou.ShirtName,ou.ShirtLogoImage,ou.SelectedShirtColor,ou.SelectedLetterColor,ou.Message,oud.JersyNumber,oud.PlayerInfo,oud.ShirtSize,us.FirstName,us.LastName FROM orderuniformplayerdetails oud left join orderuniform ou on oud.OrderUniformId=ou.OrderUniformId left join teams tm on tm.TeamId=ou.TeamId left join users us on oud.UserId=us.UserId where ou.LeagueId="' + leagueId + '"AND ou.TeamId="' + teamId + '" Order by ou.OrderUniformId Desc', function (error1, results, fields) {

        if (error1) 
        {
          CloseDbConnection(db);
        return res.status(500).send('Error on the server.');
        }
        if (results)
        {
          CloseDbConnection(db);
         return res.status(200).send(results);
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



router.post('/HnadleTeamsRequest', function (req, res, next) {
  try {
    if (!req.body.IsApproved || req.body.IsApproved == "" || req.body.IsApproved == '') {
    return  res.status(500).send({ message: 'IsApproved Status is missing' });
    } 
    connectDb(function (Error, response) {
      if (Error) {
        res.status(500).send('Unabe to Connect to Database');
      }

      db = response;
      let teamid=0
      let leagueid=0;
      if(!isNaN(req.body.teamID))
      {
      teamid = parseInt(req.body.teamID);
      }
      if(!isNaN(req.body.leagueId))
      {
      leagueid = parseInt(req.body.leagueId);
      }
      db.query('SELECT * FROM joinedteamsinleague where TeamId="'+teamid+'" and LeagueId='+leagueid, function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'No Such Record Found!' });
        }
        let IsApproved = (req.body.IsApproved ? req.body.IsApproved : "");
      
        if (results || results.length != 0) {
     
          var query = 'Update joinedteamsinleague set IsApproved="'+IsApproved+'" where TeamId='+teamid+' and LeagueId='+leagueid+'';
   

          db.query(query, function (err, results) {
 

            if (err)
            {
              CloseDbConnection(db);
          return  res.status(500).send({ message: 'Error' });
            }

          });

           //..notification sending call
          // const Notifications = new PushNotifications();
         //  Notifications.SendPushNotificationOnTeamJoining(teamid,"Your Request For Joining league hase been "+IsApproved);
           SendPushNotificationOnTeamJoining(teamid,"Your request for joining league has been "+IsApproved);
           CloseDbConnection(db);
          return res.status(200).send({ message: 'Successfully Updated!' });
        }
        CloseDbConnection(db);
        return res.status(200).send({ message: 'No Record Found!' });
      });
    });
  } catch (err) {
    CloseDbConnection(db);
console.log('exception: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});




router.post('/CheckTeamRequestExist', function (req, res, next) {
  try {
    connectDb(function (Error, response) {
      if (Error) {
      return  res.status(500).send('Unabe to Connect to Database');
      }

      db = response;
      let sportsId=0
      let CreatedBy=0;
      let leagueid=0;
      if(req.body.CreatedBy)
      CreatedBy = parseInt(req.body.CreatedBy);
      if(req.body.SportsID)
      sportsId = parseInt(req.body.SportsID);
      if(req.body.leagueId)
      leagueid = parseInt(req.body.leagueId);

      db.query('SELECT * FROM teams where Sports='+sportsId+' and CreatedBy='+CreatedBy, function (error, results, fields) {
        if (error) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error Occured!' });
        }
        if (results && results.length != 0 && results[0]) {
      db.query('SELECT * FROM joinedteamsinleague where TeamId='+results[0].TeamId+' and LeagueId='+leagueid, function (error1, result, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error Occured 1!' });
        }
        if (!result || result.length == 0) {
          CloseDbConnection(db);
          return res.status(200).send({ message: 'Request Dont Exist!',TeamID:results[0].TeamId });
        }else
        {
          CloseDbConnection(db);
        return res.status(200).send({ message: 'Request Already Sent' });
        }
      });


  }else
  {
    CloseDbConnection(db);
  return res.status(200).send({ message: 'No Team Exist For This Sports!' });
  }
});
});


  } catch (err) {
    CloseDbConnection(db);
    console.log('exception: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});



router.post('/SaveLeagueJoiningRequest', function (req, res, next) {
  try {

    connectDb(function (Error, response) {
      if (Error) {
        return  res.status(500).send('Unabe to Connect to Database');
      }

      db = response;
      let teamid=0;
      let leagueid=0;
      if (!isNaN(req.body.teamID)) {
      teamid = parseInt(req.body.teamID);
      }
      if (!isNaN(req.body.leagueId)) {
      leagueid = parseInt(req.body.leagueId);
      }
      let Name= (req.body.Name ? req.body.Name : "");
      let PaymentModule=(req.body.PaymentModule ? req.body.PaymentModule : "");
      let PaymentType=(req.body.PaymentType ? req.body.PaymentType : "");


      db.query('SELECT * FROM joinedteamsinleague where TeamId='+teamid+' and LeagueId='+leagueid, function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'No Such Record Found!' });
        }
        let IsApproved = 'Pending';
 
        if (!results || results.length == 0) {

          var query = "insert into joinedteamsinleague (TeamId,LeagueId,IsApproved)VALUES  (" + teamid + "," + leagueid + ",'" + IsApproved + "')";

          db.query(query, function (err, result) {
            if (err)
            {
              CloseDbConnection(db);
           return res.status(500).send({ message: 'Error' });
            }
            if (!results || results.length == 0) {
            //  var query1 = "insert into payments (Name,PaymentModule,PaymentType,TeamId,LeagueId)VALUES  ('" + Name + "','" + PaymentModule + "','" + PaymentType + "',"+teamid+","+leagueid+")";
           //   db.query(query1, function (err, result) {
                var query1 = "insert into payments (Name,PaymentModule,PaymentType,TeamId,LeagueId)VALUES  (?,?,?,?,?)";
                db.query(query1,[Name,PaymentModule,PaymentType,teamid,leagueid], function (err, result) {
                if (err)
                {
                  CloseDbConnection(db);
              return  res.status(500).send({ message: 'Error' });
                }
              });

              
              //..notification sending call
         //  const Notifications = new PushNotifications();
         //  Notifications.SendPushNotificationOnLeagueJoining(teamid,"New League Joining Request has been Received!");
           SendPushNotificationOnLeagueJoining(leagueid,"New League Joining Request has been Received!");
           CloseDbConnection(db);
              return res.status(200).send({ message: 'Successfully Submitted!' });
            }
            });

          }else
          {
            CloseDbConnection(db);
          return res.status(200).send({ message: 'Team Joining Request Already Exist!' });
          }
          });
                 
      });

  } catch (err) {
    CloseDbConnection(db);
    console.log('exception: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});



router.post('/GetLeague_TeamStandings', function (req, res, next) {
  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message:'Unabe to Connect to Database'});
    var numPerPage = parseInt(req.body.npp, 10) || 10;
    var page = parseInt(req.body.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {

      db = response;
      let leagueid=0;
      if(!isNaN(req.body.leagueID))
      {
      leagueid = parseInt(req.body.leagueID);
      }
      db.query('SELECT count(*) as numRows FROM leagues where LeagueId='+leagueid, function (error, results, fields) {
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({message:'Error on the server.'});
        }
        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);

          db.query(' CALL GetTeamStandings_procedure('+leagueid+')', function (error1, results, fields) {
            if (error1) 
            {
              CloseDbConnection(db);
            return res.status(500).send({ message:'Error on the server.'});
            }
            CloseDbConnection(db);
            return  res.status(200).send(new ResponeModel(numPages, page, results));
          });
        }
        else
        {
          CloseDbConnection(db);
        return  res.status(200).send({message:'League is Not Found'});
        }
      });
    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
      return  res.status(500).send({message:'Error'});
    }
  });
});


router.post('/League_ManageOrderUniform', function (req, res, next) {
  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message:'Unabe to Connect to Database'});
    var numPerPage = parseInt(req.body.npp, 10) || 10;
    var page = parseInt(req.body.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {

      db = response;
      let leagueid=0;
      if(!isNaN(req.body.leagueID))
      {
      leagueid = parseInt(req.body.leagueID);
      }
      db.query('SELECT count(*) as numRows FROM joinedteamsinleague jtl left join teams tm on jtl.TeamId=tm.TeamId where jtl.LeagueId='+leagueid, function (error, results, fields) {
      
        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({message:'Error on the server.'});
        }
        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);

          db.query('SELECT tm.TeamId,tm.TeamName FROM joinedteamsinleague jtl left join teams tm on jtl.TeamId=tm.TeamId where jtl.LeagueId='+leagueid, function (error1, results, fields) {
            if (error1) 
            {
              CloseDbConnection(db);
            return res.status(500).send('Error on the server.');
            }
            CloseDbConnection(db);
            return  res.status(200).send(new ResponeModel(numPages, page, results));
          });
        }
        else
        {
          CloseDbConnection(db);
        return  res.status(200).send({message:'League is Not Found'});
        }
      });
    } catch (err) {
      CloseDbConnection(db);
      console.log('exceptionL: ',err);
      return  res.status(500).send({message:'Error'});
    }
  });
});


router.post('/League_OrderUniformTeamPlayers', function (req, res, next) {
  connectDb(function (Error, response) {
    if (Error) return res.status(500).send({ message:'Unabe to Connect to Database'});
    var numPerPage = parseInt(req.body.npp, 10) || 10;
    var page = parseInt(req.body.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;

    try {

      db = response;
      let leagueid=0;
      let teamid=0;
      if(!isNaN(req.body.leagueId))
      {
      leagueid = parseInt(req.body.leagueId);
      }
      if(!isNaN(req.body.teamID))
      {
        teamid = parseInt(req.body.teamID);
      }
      console.log('leagueid ',leagueid);
      console.log('teamid ',teamid);
     // db.query('SELECT count(*) as numRows from users us left join orderuniformplayerdetails oud on us.UserId=oud.UserId left join orderuniform ou on oud.OrderUniformId=ou.OrderUniformId and ou.TeamId='+teamid+'  and ou.LeagueId='+leagueid, function (error, results, fields) {
        db.query('SELECT distinct count(*) as numRows from users us join usersjoinedteams uj on us.UserId=uj.UserId and uj.TeamId='+teamid+' left join orderuniform ou on uj.TeamId=ou.TeamId left join orderuniformplayerdetails oud on oud.OrderUniformId=ou.OrderUniformId and ou.TeamId='+teamid+' and ou.LeagueId='+leagueid, function (error, results, fields) {
      
        if (error) 
        {
          CloseDbConnection(db);
        return res.status(500).send({message:'Error on the server.'});
        }
        if (results && results[0] && results[0].numRows) {
          numRows = results[0].numRows;
          numPages = Math.ceil(numRows / numPerPage);

        //  db.query('select us.UserId,us.FirstName,us.LastName, oud.OrderUniformPlayerDetailId,oud.JersyNumber,oud.PlayerInfo,oud.ShirtSize,ou.* from users us left join orderuniformplayerdetails oud on us.UserId=oud.UserId left join orderuniform ou on oud.OrderUniformId=ou.OrderUniformId and ou.TeamId='+teamid+'  and ou.LeagueId='+leagueid, function (error1, results, fields) {
            db.query('select ou.OrderUniformId,us.UserId,us.FirstName,us.LastName, oud.OrderUniformPlayerDetailId,oud.JersyNumber,oud.PlayerInfo,oud.ShirtSize,ou.* from users us join usersjoinedteams uj on us.UserId=uj.UserId and uj.TeamId='+teamid+' left join orderuniform ou on uj.TeamId=ou.TeamId left join orderuniformplayerdetails oud on oud.OrderUniformId=ou.OrderUniformId and ou.TeamId='+teamid+'  and ou.LeagueId='+leagueid, function (error1, results, fields) {
          
            if (error1) 
            {
              CloseDbConnection(db);
            return res.status(500).send('Error on the server.');
            }
            CloseDbConnection(db);
            return  res.status(200).send(new ResponeModel(numPages, page, results));
          });
        }
        else
        {
          CloseDbConnection(db);
        return  res.status(200).send({message:'No Data Found'});
        }
      });
    } catch (err) {
      CloseDbConnection(db);
      console.log('exception: ',err);
      return  res.status(500).send({message:'Error'});
    }
  });
});


router.post('/SaveUniformOrder', function (req, res, next) {
  try {

  
    /* if (!req.body.ShirtName || req.body.ShirtName == "" || req.body.ShirtName == '') {
      return  res.status(500).send({ message: 'ShirtName is missing!' });
    }
    if (!req.body.Message || req.body.Message == "" || req.body.Message == '') {
      return  res.status(500).send({ message: 'Message is missing!' });
    }
    if (!req.body.selectedShirtColor || req.body.selectedShirtColor == "" || req.body.selectedShirtColor == '') {
      return res.status(500).send({ message: 'selectedShirtColor is missing!' });
    }
     if (!req.body.selectedLetterColor || req.body.selectedLetterColor == "" || req.body.selectedLetterColor == '') {
      res.status(500).send({ message: 'selectedLetterColor is missing!' });
    } 
    if (!req.body.ShirtLogoImage || req.body.ShirtLogoImage == "" || req.body.ShirtLogoImage == '') {
      return  res.status(500).send({ message: 'ShirtLogoImage is missing!' });
    }
    if (!req.body.UniformDetailObj || req.body.UniformDetailObj == "" || req.body.UniformDetailObj == '') {
      return  res.status(500).send({ message: 'UniformDetailObj is missing!' });
    } */
  

    connectDb(function (Error, response) {
      if (Error) {
    
        return  res.status(500).send({ message: 'Unabe to Connect to Database' });
      }
      var UniformOrder_Id = 0;
      var League_Id = 0;
      var Team_Id = 0;
      if (req.body.ExkistingUniformOrderID && !isNaN(req.body.ExkistingUniformOrderID)) {
        UniformOrder_Id = parseInt(req.body.ExkistingUniformOrderID);
      }
      if (req.body.LeagueID && !isNaN(req.body.LeagueID)) {
        League_Id = parseInt(req.body.LeagueID);
      }
      if (req.body.TeamID && !isNaN(req.body.TeamID)) {
        Team_Id = parseInt(req.body.TeamID);
      }
      db = response;
console.log('req.body ',req.body);
      db.query("SELECT * FROM orderuniform Where OrderUniformId=" + UniformOrder_Id, function (error1, results, fields) {
        if (error1) {
          console.log('error1 1',error1);
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }
        
        let ShirtName = req.body.ShirtName?req.body.ShirtName:'' ;
        let Message =  req.body.Message?req.body.Message:'' ;
        let selectedShirtColor = req.body.selectedShirtColor?req.body.selectedShirtColor:'' ;
        let selectedLetterColor = req.body.selectedLetterColor?req.body.selectedLetterColor:'' ;
        let ShirtLogoImage =  req.body.ShirtLogoImage?req.body.ShirtLogoImage:'' ;
        let UniformDetailObj = req.body.UniformDetailObj?req.body.UniformDetailObj:[] ;


        if (results && results.length != 0) {
       

    
        //   var query = "Update orderuniform set Message='" + Message + "',ShirtLogoImage='" + ShirtLogoImage + "',ShirtName='" + ShirtName + "',SelectedLetterColor='" + selectedLetterColor + "',SelectedShirtColor='" + selectedShirtColor + "' Where OrderUniformId=" + UniformOrder_Id+ "";;
         //   db.query(query, function (err, result1) {
              var query = "Update orderuniform set Message=?,ShirtLogoImage=?,ShirtName=?,SelectedLetterColor=?,SelectedShirtColor=? Where OrderUniformId=?";;
              db.query(query,[Message,ShirtLogoImage,ShirtName,selectedLetterColor,selectedShirtColor,UniformOrder_Id], function (err, result1) {
              if (err)
              {
                console.log('error1 2',err);
                CloseDbConnection(db);
                return res.status(500).send({ message: 'Error' });
              }

                if(result1)
                {    


               //inner table queries

               if(UniformDetailObj)
               {
                 UniformDetailObj.map((currentValue, index) => {    

                  db.query("SELECT * FROM orderuniformplayerdetails Where OrderUniformId='"+UniformOrder_Id+"' and UserId=" + currentValue.UserID, function (error1, result2, fields) {
                    if (error1) {
                      console.log('error1 3',error1);
                      CloseDbConnection(db);
                      return res.status(500).send({ message: 'Error' });
                    }
                   
                    if (result2 && result2.length != 0) {
                      console.log('result2 ',result2);
                     // var query = "Update orderuniformplayerdetails set JersyNumber='" + currentValue.JerseyNumber + "',PlayerInfo='" + currentValue.PayerInfo + "',ShirtSize='" + currentValue.ShirtSize + "' Where UserId=" + currentValue.UserID+ "";  
                    //  db.query(query, function (err, results) {
                        var query = "Update orderuniformplayerdetails set JersyNumber=?,PlayerInfo=?,ShirtSize=? Where UserId=? and OrderUniformId=?";  
                        db.query(query,[currentValue.JerseyNumber,currentValue.PayerInfo,currentValue.ShirtSize,currentValue.UserID,UniformOrder_Id], function (err, results) {
                        if (err)
                        {
                          console.log('error1 4',err);
                          CloseDbConnection(db);
                          return res.status(500).send({ message: 'Error' });
                        }
                      }); 
                    }else
                    {
                //   var query = "insert into orderuniformplayerdetails (JersyNumber,PlayerInfo,ShirtSize,UserId,OrderUniformId)  VALUES  ('" + currentValue.JerseyNumber + "','" + currentValue.PayerInfo + "','"+currentValue.ShirtSize+"'," + currentValue.UserID + "," + result1.insertId + ")";
                //   db.query(query, function (err, results) {
                    var query = "insert into orderuniformplayerdetails (JersyNumber,PlayerInfo,ShirtSize,UserId,OrderUniformId)  VALUES  (?,?,?,?,?)";
                    db.query(query,[currentValue.JerseyNumber,currentValue.PayerInfo,currentValue.ShirtSize,currentValue.UserID,UniformOrder_Id], function (err, results) {
                     if (err)
                     {
                      console.log('error1 5',err);
                      CloseDbConnection(db);
                       return res.status(500).send({ message: 'Error' });
                     }
                   }); 
                                                         
                  }

                 });
               });
              }
              //inner table queries
   

                }



            });
 

        } else {
         
            
        //  var query = "Insert into orderuniform (Message,ShirtLogoImage,ShirtName,TeamId,SelectedLetterColor,SelectedShirtColor,LeagueId)VALUES  ('" + Message + "','" + ShirtLogoImage + "','" + ShirtName + "'," + Team_Id + ",'" + selectedLetterColor + "','" + selectedShirtColor + "'," + League_Id + ")";
        //  db.query(query, function (err, result1) {
            var query = "Insert into orderuniform (Message,ShirtLogoImage,ShirtName,TeamId,SelectedLetterColor,SelectedShirtColor,LeagueId)VALUES  (?,?,?,?,?,?,?)";
            db.query(query,[Message,ShirtLogoImage,ShirtName,Team_Id,selectedLetterColor,selectedShirtColor,League_Id], function (err, result1) {
            if (err)
            {
              console.log('error1 6',err);
              CloseDbConnection(db);
              return res.status(500).send({ message: 'Error' });
            }


              if(result1 && result1.insertId)
              {    

              //inner table queries

              if(UniformDetailObj)
              {
                UniformDetailObj.map((currentValue, index) => {                                
                //  var query = "insert into orderuniformplayerdetails (JersyNumber,PlayerInfo,ShirtSize,UserId,OrderUniformId)  VALUES  ('" + currentValue.JerseyNumber + "','" + currentValue.PayerInfo + "','"+currentValue.ShirtSize+"'," + currentValue.UserID + "," + result1.insertId + ")";
               //   db.query(query, function (err, results) {
                    var query = "insert into orderuniformplayerdetails (JersyNumber,PlayerInfo,ShirtSize,UserId,OrderUniformId)  VALUES  (?,?,?,?,?)";
                    db.query(query,[currentValue.JerseyNumber,currentValue.PayerInfo,currentValue.ShirtSize,currentValue.UserID,result1.insertId], function (err, results) {
              
                    if (err)
                    {
                      console.log('error1 7',err);
                      CloseDbConnection(db);
                      return res.status(500).send({ message: 'Error' });
                    }
                  });                                  
                });
              }
 
             //inner table queries

              }



          });




        }
     //   CloseDbConnection(db);
        return res.status(200).send({ message: 'Successfully Submitted!' });

      });
    });
  } catch (err) {
    CloseDbConnection(db);
    console.log('exception: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});


module.exports = router;