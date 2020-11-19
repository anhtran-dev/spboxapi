
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var connectDb = require('./DbConnection');
var fetch = require('node-fetch');
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

var db;

//class PushNotifications {



 //  SendPushNotification (UserID,NotificationText) {
  module.exports = SendPushNotification = async (UserID,NotificationText) => {
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
               return "Sent";
                }
                else
                {
                return "Failed";
                }
              });
            } catch (err) {
            }
          });
          return "Failed";
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




 // SendPushNotificationToGroup (GroupID,NotificationText) {
    module.exports =  SendPushNotificationToGroup =(GroupID,NotificationText) => {
    try {
  

        connectDb(function (Error, response) {
            if (Error) return "'Unabe to Connect to Database'";
            try {
              var GroupId = 0;
              if(!isNaN(GroupID))
              {
                GroupId = parseInt(GroupID);
              }
              db = response; var messages = [];
              db.query('SELECT * from groupusers  where GroupId=' + GroupId, function (error1, results, fields) {
                if (error1) return  "Failed";
                if (results && results.length>0)
                {
                  let res="Failed";
                  results.forEach(function(myString)
                  {
                    res=  SendPushNotification_WithInClass(myString.UserId,NotificationText);
                  }); 
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


//  SendPushNotificationOnTeamJoining (TeamID,NotificationText) {
    module.exports =  SendPushNotificationOnTeamJoining =(TeamID,NotificationText) => {
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


//  SendPushNotificationOnLeagueJoining (LeagueID,NotificationText) {
    module.exports =  SendPushNotificationOnLeagueJoining =(LeagueID,NotificationText) => {
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


 // SendPushNotificationOnEventInvitaions (EventID,NotificationText) {
    module.exports =  SendPushNotificationOnEventInvitaions =(EventID,NotificationText) => {
    try {
  

        connectDb(function (Error, response) {
            if (Error) return "'Unabe to Connect to Database'";
            try {
              var EventId = 0;
              if(!isNaN(EventID))
              {
                EventId = parseInt(EventID);
              }
              db = response; var messages = [];
              db.query('SELECT * from Events  where EventId=' + EventId, function (error1, results, fields) {
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


//}
  //module.exports = PushNotifications;

