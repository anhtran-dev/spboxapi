var express= require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var connectDb = require('./DbConnection');
var ResponeModel = require('./Models/ResponeModel');
var ManageInvitationPlayersModel = require('./Models/ManageInvitationPlayers');
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

//var SendPushNotificationOnEventInvitaions =require('./PushNotifications');
//const SendPushNotification =require('./PushNotifications');
const CloseDbConnection =require('./common');
var fetch = require('node-fetch');
var db;


async function SendPushNotification(UserID,NotificationText) {


  try {

      console.log('its called in push noptification');

      connectDb(function (error, response) {
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
async function SendPushNotificationOnEventInvitaions(EventID,NotificationText) {

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


router.post('/GetEventsList', function (req, res, next) {

  connectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });
        var numPerPage = parseInt(req.params.npp, 10) || 10;
        var page = parseInt(req.params.page, 10) || 0;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;

try{

        db = response; var arr = [];
        db.query('SELECT count(*) as numRows FROM events where IsDeleted=false', function (error, results, fields) {

            if (error)
            {
              CloseDbConnection(db);
            return res.status(500).send({message:'Error on the server.'});
            }
            if (results && results[0] && results[0].numRows){
                numRows = results[0].numRows;
                numPages = Math.ceil(numRows / numPerPage);

              //  db.query('SELECT * FROM events where IsDeleted=false Order by EventId Desc LIMIT '+ limit, function (error1, results, fields) {
                  db.query('SELECT * FROM events where IsDeleted=false Order by EventId Desc', function (error1, results, fields) {
                  if (error1)
                  {
                    CloseDbConnection(db);
                  return res.status(500).send({message:'Error on the server.'});    
                  }  
                  CloseDbConnection(db);          
                  return  res.status(200).send(new ResponeModel(numPages,page,results));
                });
            }
            else
            {
              CloseDbConnection(db);
              return  res.status(200).send({message:'No Data Found!'});
            }
        });        
}catch(err)
{
  CloseDbConnection(db);
  console.log('exception error: ',err);
return  res.status(500).send({ message: 'Error Occurred: ' + err });
}
    });
});

router.post('/SearchEventsList', function (req, res, next) {

  connectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });
        var numPerPage = parseInt(req.params.npp, 10) || 10;
        var page = parseInt(req.params.page, 10) || 0;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;

try{

       let SearchText = '';
      if (req.body.EventTitle) {
        SearchText = req.body.EventTitle;
       }

        db = response; var arr = [];
        db.query('SELECT count(*) as numRows FROM events where Title LIKE "%'+SearchText+'%" and IsDeleted=false', function (error, results, fields) {

            if (error)
            {
              CloseDbConnection(db);
            return res.status(500).send({message:'Error on the server.'});
            }
            if (results && results[0] && results[0].numRows){
                numRows = results[0].numRows;
                numPages = Math.ceil(numRows / numPerPage);

                db.query('SELECT * FROM events where Title LIKE "%'+SearchText+'%" and IsDeleted=false Order by EventId Desc LIMIT '+ limit, function (error1, results, fields) {
      
                  if (error1)
                  {
                    CloseDbConnection(db);
                  return res.status(500).send({message:'Error on the server.'});    
                  }  
                  CloseDbConnection(db);          
                  return  res.status(200).send(new ResponeModel(numPages,page,results));
                });
            }
            else
            {
              CloseDbConnection(db);
              return  res.status(200).send(new ResponeModel(numPages,page,results=null));
            }
        });        
}catch(err)
{
  CloseDbConnection(db);
  console.log('exception error: ',err);
return  res.status(500).send({ message: 'Error Occurred: ' + err });
}
    });
});



router.post('/ManageEvents', function (req, res, next) {
  connectDb(async function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });

    try {
      let EventId = 0;
      if (!isNaN(req.body.EventID)) {
        EventId = parseInt(req.body.EventID);
      }
      db = response;
  

      if (EventId != 0) {
            db.query('SELECT * FROM events where EventId='+ EventId, function (error1, results, fields) {

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

    } catch(err)
    {
      CloseDbConnection(db);
      console.log('exception error: ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});



router.post('/SaveEvents', function (req, res, next) {
    try {
  
        if (!req.body.Title || req.body.Title == "")
        {
        return    res.status(500).send({message: 'Title Fields are missing'});
        }
        if (!req.body.Location || req.body.Location == "" )
        {
        return    res.status(500).send({message: 'Location Fields are missing'});
        }
        if (!req.body.Description || req.body.Description == "" )
        {
        return    res.status(500).send({message: 'Description Fields are missing'});
        }
        if (!req.body.EventDate || req.body.EventDate == "" )
        {
        return    res.status(500).send({message: 'EventDate Fields are missing'});
        }
        if (!req.body.EventTime || req.body.EventTime == "" )
        {
        return    res.status(500).send({message: 'EventTime Fields are missing'});
        }
        if (!req.body.CreatedBy || req.body.CreatedBy == "" )
        {
       return     res.status(500).send({message: 'CreatedBy Fields are missing'});
        }

        
      connectDb(function (Error, response) {
        if (Error) {
        return  res.status(500).send({message:'Unabe to Connect to Database'});
        }  
        let EventId =0;
        if(req.body.EventID)
        {
          EventId= parseInt(req.body.EventID);
        }
        db = response;

   let Title = (req.body.Title ? req.body.Title : "");
   let Location = (req.body.Location ? req.body.Location : "");
   let Description = (req.body.Description ? req.body.Description : "");
   let EventDate = (req.body.EventDate ? req.body.EventDate : "");
   let EventTime = (req.body.EventTime ? req.body.EventTime : "");
   let CreatedBy = (req.body.CreatedBy ? req.body.CreatedBy : "");

   var d = new Date(EventDate);
   var day = d.getDate()
   var monthIndex = d.getMonth();
   var year = d.getFullYear();

   EventDate = year +"-"+ monthIndex +"-"+ day;

    if(EventId!=0)
   {
  //   var query = 'Update events set Title ="' + Title + '",Location="' + Location + '",Description="' + Description + '",EventDate="' + EventDate + '",EventTime="' + EventTime + '",CreatedBy="' + CreatedBy + '" where EventId=' + EventId;
  //   db.query(query, function (err, results) {
      var query = 'Update events set Title =?,Location=?,Description=?,EventDate=?,EventTime=?,CreatedBy=? where EventId=?';
      db.query(query,[Title,Location,Description,EventDate,EventTime,CreatedBy,EventId], function (err, results) {
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
  //  var query = "insert into events (Title,Location,Description,EventDate,EventTime,CreatedBy)VALUES  ('" + Title + "','" + Location + "','" + Description + "','" + EventDate + "',REPLACE(REPLACE('" + EventTime + "', 'pm', ''), 'am', '')," + CreatedBy + ")";
  //  db.query(query, function (err, results) {
      var query = "insert into events (Title,Location,Description,EventDate,EventTime,CreatedBy)VALUES  (?,?,?,?,REPLACE(REPLACE('" + EventTime + "', 'pm', ''), 'am', ''),?)";
      db.query(query,[Title,Location,Description,EventDate,CreatedBy], function (err, results) {
      if (err)
      {
        CloseDbConnection(db);
        return res.status(500).send({ message: 'Error' });
      }
    });

  }
  CloseDbConnection(db);
  return res.status(200).send({ message: 'Success' });
 
  });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception error: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
  });

  router.post('/DeleteEvents', function (req, res, next) {
    try {   
      connectDb(function (Error, response) {
        if (Error) {
        return  res.status(500).send({message:'Unabe to Connect to Database'});
        }  
        let EventId =0;
        if(req.body.EventID)
        {
          EventId= parseInt(req.body.EventID);
        }
        db = response;
    if(EventId!=0)
   {
     var query = 'Update events set IsDeleted =true where EventId='+EventId;
     db.query(query, function (err, results) {

       if (err)
       {
        CloseDbConnection(db);
     return  res.status(500).send({ message: 'Error' });
       }
     });
     CloseDbConnection(db);
     return res.status(200).send({ message: 'Success' });
   }else 
{
  CloseDbConnection(db);
  return res.status(200).send({ message: 'Data Not Found' });
}
  });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception error: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
  });

  router.post('/GetEventInvitationsList', function (req, res, next) {

    connectDb(function (Error, response) {
          if (Error) return res.status(500).send({ message: 'Error' });
          var numPerPage = parseInt(req.body.npp, 10) || 10;
          var page = parseInt(req.body.page, 10) || 0;
          var numPages;
          var skip = page * numPerPage;
          // Here we compute the LIMIT parameter for MySQL query
          var limit = skip + ',' + numPerPage;
  
  try{
    let UserId = 0;
    if (!isNaN(req.body.UserID)) {
      UserId = parseInt(req.body.UserID);
    }
          db = response; var arr = [];
          db.query('SELECT count(*) as numRows FROM eventinvitations ei left join events ev on ev.EventId=ei.EventId where ei.UserId='+UserId, function (error, results, fields) {
  
              if (error)
              {
                CloseDbConnection(db);
                console.log('error ',error);
              return res.status(500).send('Error on the server.1');
              }
              if (results && results[0] && results[0].numRows){
                  numRows = results[0].numRows;
                  numPages = Math.ceil(numRows / numPerPage);
  
                //  db.query('SELECT * FROM sportsbox.eventinvitations ei left join events ev on ev.EventId=ei.EventId where ei.UserId="'+UserId+'" Order by ev.EventId Desc LIMIT '+ limit, function (error1, results, fields) {
                    db.query('SELECT * FROM eventinvitations ei left join events ev on ev.EventId=ei.EventId where ei.UserId="'+UserId+'" Order by ev.EventId Desc ', function (error1, results, fields) {
     
                    if (error1)
                    {
                      CloseDbConnection(db);
                      console.log('error1 ',error1);
                    return res.status(500).send('Error on the server.');  
                    }    
                    CloseDbConnection(db);             
                    return  res.status(200).send(new ResponeModel(numPages,page,results));
                  });
              }
              else
              {
                CloseDbConnection(db);
                return  res.status(200).send({message:'No Data Found!'});
              }
          });        
  }catch(err)
  {
    CloseDbConnection(db);
    console.log('exception error: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
      });
  });


  router.post('/SearchEventInvitationsList', function (req, res, next) {

    connectDb(function (Error, response) {
          if (Error) return res.status(500).send({ message: 'Error' });
          var numPerPage = parseInt(req.body.npp, 10) || 10;
          var page = parseInt(req.body.page, 10) || 0;
          var numPages;
          var skip = page * numPerPage;
          // Here we compute the LIMIT parameter for MySQL query
          var limit = skip + ',' + numPerPage;
  
  try{
    let UserId = 0;
    let SearchText = '';
    if (!isNaN(req.body.UserID)) {
      UserId = parseInt(req.body.UserID);
    }
    if (req.body.EventTitle && req.body.EventTitle!=null) {
      console.log('req.body.EventTitle ',req.body.EventTitle);
      SearchText = req.body.EventTitle;
     }
          db = response; var arr = [];
          db.query('SELECT count(*) as numRows FROM eventinvitations ei left join events ev on ev.EventId=ei.EventId where ev.Title LIKE "%'+SearchText+'%" and ei.IsDeleted=false and ei.UserId='+UserId, function (error, results, fields) {
  
              if (error)
              {
                CloseDbConnection(db);
                console.log('error ',error);
              return res.status(500).send({message:'Error on the server.'});
              }
              if (results && results[0] && results[0].numRows){
                  numRows = results[0].numRows;
                  numPages = Math.ceil(numRows / numPerPage);
  
                  db.query('SELECT * FROM eventinvitations ei left join events ev on ev.EventId=ei.EventId where ei.UserId="'+UserId+'" and ei.IsDeleted=false and ev.Title LIKE "%'+SearchText+'%" Order by ev.EventId Desc ', function (error1, results, fields) {
     
                    if (error1)
                    {
                      CloseDbConnection(db);
                      console.log('error1 ',error1);
                    return res.status(500).send({message:'Error on the server.'});  
                    }    
                    CloseDbConnection(db);             
                    return  res.status(200).send(new ResponeModel(numPages,page,results));
                  });
              }
              else
              {
                CloseDbConnection(db);
                return  res.status(200).send(new ResponeModel(numPages,page,results=null));
              }
          });        
  }catch(err)
  {
    CloseDbConnection(db);
    console.log('exception error: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
      });
  });


  router.post('/AcceptEvent', function (req, res, next) {
    try {   
      connectDb(function (Error, response) {
        if (Error) {
          res.status(500).send({message:'Unabe to Connect to Database'});
        }  
        let EventId =0;
        let UserId =0;
        if(req.body.EventID)
        {
          EventId= parseInt(req.body.EventID);
        }        
        if(req.body.UserID)
        {
          UserId= parseInt(req.body.UserID);
        }
        db = response;
    if(EventId!=0 && UserId!=0)
   {

    db.query('SELECT count(*) as numRows FROM eventinvitations where EventId='+EventId+' AND UserId='+UserId, function (error, results, fields) {

        if (error)
        {
          console.log('error 1 ' ,error)
          CloseDbConnection(db);
        return res.status(500).send('Error on the server.');
        }
        if (results && results[0] && results[0].numRows){


                
          var query = 'Update eventinvitations set IsAccepted=true,IsRejected=false where EventId='+EventId+' AND UserId='+UserId;
     db.query(query, function (err, results) {

       if (err)
       {
        console.log('err 1 ' ,err)
        CloseDbConnection(db);
      return res.status(500).send({ message: 'Error' });
       }
     });
     //..notification sending call
    // const Notifications = new PushNotifications();
    // Notifications.SendPushNotificationOnEventInvitaions(EventId,"Event Invitaion Accepted by Recepient!");
     SendPushNotificationOnEventInvitaions(EventId,"Event Invitaion Accepted by Recepient!");
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
  return res.status(200).send({ message: 'EventID or UserID is missing' });
}
  });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception error: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
  });
  router.post('/RejectEvent', function (req, res, next) {
    try {   
      connectDb(function (Error, response) {
        if (Error) {
          res.status(500).send('Unabe to Connect to Database');
        }  
        let EventId =0;
        let UserId =0;
        if(req.body.EventID)
        {
          EventId= parseInt(req.body.EventID);
        }        
        if(req.body.UserID)
        {
          UserId= parseInt(req.body.UserID);
        }
        db = response;
    if(EventId!=0 && UserId!=0)
   {

    db.query('SELECT count(*) as numRows FROM eventinvitations where EventId='+EventId+' AND UserId='+UserId, function (error, results, fields) {

        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send('Error on the server.');
        }
        if (results && results[0] && results[0].numRows){


                
     var query = 'Update eventinvitations set IsAccepted=false,IsRejected=true where EventId='+EventId+' AND UserId='+UserId;
     db.query(query, function (err, results) {

       if (err)
       {
      return res.status(500).send({ message: 'Error' });
       }
     });
     //..notification sending call
     //const Notifications = new PushNotifications();
     //Notifications.SendPushNotificationOnEventInvitaions(EventId,"Event Invitaion Rejected by Recepient!");
     SendPushNotificationOnEventInvitaions(EventId,"Event Invitaion Rejected by Recepient!");
     CloseDbConnection(db);
     return res.status(200).send({ message: 'Success' });
        }
        else
        {
          CloseDbConnection(db);
           return res.status(200).send({message:'No Data Found!'});
        }
    }); 





   }else 
{
  CloseDbConnection(db);
  return res.status(200).send({ message: 'EventID or UserID is missing' });
}
  });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception error: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
  });

  router.post('/SendEventInvitations', function (req, res, next) {
    try {
  
        if (!req.body.EventID || req.body.EventID == "")
        {
        return    res.status(500).send({message: 'EventID is missing'});
        }
        if (!req.body.UserID || req.body.UserID == "" )
        {
        return    res.status(500).send({message: 'UserID is missing'});
        }
       
        
      connectDb(function (Error, response) {
        if (Error) {
        return  res.status(500).send('Unabe to Connect to Database');
        }  
        let EventId =0;
        let UserId =0;
        if(req.body.EventID)
        {
          EventId= parseInt(req.body.EventID);
        }        
        if(req.body.UserID)
        {
          UserId= parseInt(req.body.UserID);
        }
        db = response;

         db.query('SELECT count(*) as numRows FROM eventinvitations where EventId='+EventId+' AND UserId='+UserId, function (error, results, fields) {
 
             if (error)
             {
              CloseDbConnection(db);
             return res.status(500).send('Error on the server.');
             }
             if (results && results[0] && results[0].numRows){
                          
          var query = 'Update eventinvitations set IsDeleted=false,IsRejected=false,IsAccepted=false where EventId='+EventId+' AND UserId='+UserId;
          db.query(query, function (err, results) {
       
            if (err)
            {
              CloseDbConnection(db);
          return  res.status(500).send({ message: 'Error' });
            }
          });
             }
           else  {       
              var query = "insert into eventinvitations (EventId,UserId)VALUES  (" + EventId + "," + UserId + ")";
              db.query(query, function (err, results) {
            
                if (err)
                {
                  CloseDbConnection(db);
                  return res.status(500).send({ message: 'Error' });
                }
              });         
            }
            //..notification sending call
          //  const Notifications = new PushNotifications();
          //  Notifications.SendPushNotification(UserId,"New Event Invitation Received!");
            SendPushNotification(UserId,"New Event Invitation Received!");
            CloseDbConnection(db);
            return res.status(200).send({ message: 'InvitationSent Successfully!' });

         }); 
     

  });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception errpor: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
  });

  router.post('/RemovePlayerInvited', function (req, res, next) {
    try {   
      connectDb(function (Error, response) {
        if (Error) {
       return   res.status(500).send('Unabe to Connect to Database');
        }  
        let EventId =0;
        let UserId =0;
        if(req.body.EventID)
        {
          EventId= parseInt(req.body.EventID);
        }        
        if(req.body.UserID)
        {
          UserId= parseInt(req.body.UserID);
        }
        db = response;
    if(EventId!=0 && UserId!=0)
   {

    db.query('SELECT count(*) as numRows FROM eventinvitations where EventId='+EventId+' AND UserId='+UserId, function (error, results, fields) {
   
        if (error) 
        {
          CloseDbConnection(db);
        return res.status(500).send('Error on the server.');
        }
        if (results && results[0] && results[0].numRows){


                
     var query = 'Update eventinvitations set IsDeleted=true,IsRejected=false,IsAccepted=false where EventId='+EventId+' AND UserId='+UserId;
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
       return  res.status(200).send({message:'No Data Found!'});
        }
    }); 





   }else 
{
  CloseDbConnection(db);
  return res.status(200).send({ message: 'EventID or UserID is missing' });
}
  });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception eror: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
  });




  let PlayersList = []; let GroupUsers = [];
  router.post('/Invitation_PlayersList', function (req, res, next) {

    connectDb(async function (Error, response) {
          if (Error) return res.status(500).send({ message: 'Error' });
          var numPerPage = parseInt(req.body.npp, 10) || 10;
          var page = parseInt(req.body.page, 10) || 0;
          var numPages;
          var skip = page * numPerPage;
          var limit = skip + ',' + numPerPage;
  
  try{
    let EventID = 0;
    if (!isNaN(req.body.EventId)) {
      EventID = parseInt(req.body.EventId);
    }
          db = response; var arr = [];

          await LoadPlayersData(EventID,function (results, error1) {
  
            res.status(200).send(results);
          });

  }catch(err)
  {
    res.status(500).send({ message: 'Error Occurred: ' + err });
  }
      });
  });
async function LoadPlayersData(EventID,callback) {
  let promises = [];

  promises.push(GetPlayersDetails('SELECT * FROM users', 'PlayersList', db));
  promises.push(GetPlayersDetails('select * from eventinvitations where EventId=' + EventID, 'GroupUsers', db));

  await Promise.all(promises);
  var objModel = new ManageInvitationPlayersModel();
  objModel.PlayersList=PlayersList;
  objModel.GroupUsersList = GroupUsers;
  await callback(objModel);
};

async function GetPlayersDetails(query, type, db) {
  try {
    return new Promise(function (resolve, reject) {
      db.query(query, function (error, results, fields) {
        if (error) {
          reject(new Error('Ooops, something broke!'));
        } else {
          if (type == 'PlayersList')
          PlayersList = results;
          if (type == 'GroupUsers')
          GroupUsers = results;
          resolve(results);
        }
      });
    });
  } catch (error) {
  }
};


module.exports = router;