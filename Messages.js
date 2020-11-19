var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var connnectDb = require('./DbConnection');
var ResponeModel = require('./Models/ResponeModel');
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

//const SendPushNotification =require('./PushNotifications');
//const SendPushNotificationToGroup =require('./PushNotifications');

const CloseDbConnection =require('./common');
var fetch = require('node-fetch');

var db;

router.post('/testnotification', async function (req, res, next) {
    console.log('test noti ');
    SendPushNotification(26,"New Message Arrives!");
    return res.status(200).send({ message: 'worked!' });
  /*   connnectDb(function (error, response) {
        if (error) return "Unabe to Connect to Database";
      //  if(response)
       // console.log(response);
        try {
          var UID = 0;
          if(!isNaN(15))
          {
            UID = parseInt(15);
          }
          db = response; var messages = [];
          db.query('SELECT ExpoToken from users  where UserId=' + UID, function (error1, results, fields) {
            if (error1) return  "Failed";   //res.status(500).send({message:'Error on the server.'});
            if (results && results.length>0 && results[0])
            {
            messages.push({
                to: results[0].ExpoToken,
                sound: 'default',
                body: 'NotificationText',
              });
            fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(messages),
              });
         //  return "Sent";
           return res.status(200).send({ message: 'worked!' });
            }
            else
            {
           // return "Failed";
            return res.status(200).send({ message: 'Failed!' });
            }
          });
        } catch (err) {
            console.log('error ',err);
        }
      }); */
   // return res.status(200).send({ message: 'worked!' });
});

//..these are push notification methods
  async function SendPushNotification(UserID,NotificationText,NotificationType) {


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
                      data: { type: NotificationType},
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

  async function SendPushNotificationToGroup(GroupID,NotificationText,NotificationType) {

    try {
  

        connnectDb(function (Error, response) {
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
                    res=  SendPushNotification_WithInClass(myString.UserId,NotificationText,NotificationType);
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
  const SendPushNotification_WithInClass = (UserID,NotificationText,NotificationType) => {
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
                    data: { type: NotificationType},
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
//..above are push notification methods


router.post('/GetDirectChatsList', function (req, res, next) {

    connnectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });
        var numPerPage = parseInt(req.body.npp, 10) || 10;
        var page = parseInt(req.body.page, 10) || 0;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;

        try {
            var User_Id = 0;
            if (!isNaN(req.body.UserId)) {
                User_Id = parseInt(req.body.UserId);
            }
            db = response; var arr = [];
            db.query('SELECT count(*) as numRows FROM  sportsbox.groups grp join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId join sportsbox.users usr on grpusr.UserId = usr.UserId left join sports sp on usr.Game=sp.SportId left join roles rol on usr.Role=rol.RoleId where grp.IsDirectChat=true and grp.IsDeleted=false and grpusr.UserId <> '+User_Id+' and grpusr.groupId in ( select grp.groupId from sportsbox.groups grp join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId where IsDirectChat=true and userId='+User_Id+')', function (error, results, fields) {
                if (error)
                {
                    CloseDbConnection(db);
                 return res.status(500).send({ message: "Error on the server." });
                }
              
                if (results && results[0] && results[0].numRows) {
                    numRows = results[0].numRows;
                    numPages = Math.ceil(numRows / numPerPage);
                    db.query('SELECT usr.*,grp.*,sp.Name as SportName,rol.RoleName ,(select CreatedAt from chatmessages where GroupId=grp.GroupId order by CreatedAt desc LIMIT 0, 1) as LastMessageDate FROM  sportsbox.groups grp left join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId left  join sportsbox.users usr on grpusr.UserId = usr.UserId left join sports sp on usr.Game=sp.SportId left join roles rol on usr.Role=rol.RoleId where grp.IsDirectChat=true and grp.IsDeleted=false and grpusr.UserId <> '+User_Id+' and grpusr.groupId in ( select grp.groupId from sportsbox.groups grp left join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId where IsDirectChat=true and userId='+User_Id+') Order by usr.UserId Desc LIMIT ' + limit, function (error1, result, fields) {
                        if (error1)
                        {
                            CloseDbConnection(db);
                         return res.status(500).send({ message: "Error on the server." });
                        }
                        CloseDbConnection(db);
                      return  res.status(200).send(new ResponeModel(numPages, page, result));
                    });
                }
                else {
                    CloseDbConnection(db);
                  return  res.status(200).send({ message: "No Data Found" });
                }
            });


        } catch (err) {
            CloseDbConnection(db);
            console.log('exception error: ',err);
          return  res.status(500).send({ message: 'Error Occurred: ' + err });
          }
    });
});


router.post('/SendChatMessages', function (req, res, next) {
    try {

        if (!req.body.MessageDescription || req.body.MessageDescription == "" || req.body.MessageDescription == '') {
          return  res.status(500).send({ message: 'MessageDescription is missing!' });
        }
        if (!req.body.CreatedBy || req.body.CreatedBy == "" || req.body.CreatedBy == '') {
            return   res.status(500).send({ message: 'CreatedBy is missing!' });
        }
        connnectDb(function (Error, response) {
            if (Error) {
              return  res.status(500).send({message:'Unabe to Connect to Database!'});
            }
            let GroupId = 0;
            let CreatedBy=null;
            let SenderID=null;
            let ReceiverID=null;
            if (!isNaN(req.body.CreatedBy)) {
                CreatedBy = parseInt(req.body.CreatedBy);
            }
            if (!isNaN(req.body.GroupId)) {
                GroupId = parseInt(req.body.GroupId);
            }
            if (!isNaN(req.body.SenderID)) {
                SenderID = parseInt(req.body.SenderID);
            }
            if (!isNaN(req.body.ReceiverID)) {
                ReceiverID = parseInt(req.body.ReceiverID);
            }
            let MessageDescription = (req.body.MessageDescription ? req.body.MessageDescription : "");
            db = response;

            if (GroupId != 0) {

                db.query('SELECT * FROM sportsbox.groups Where GroupId=' + GroupId, function (error1, results, fields) {
                    if (error1) {
                        CloseDbConnection(db);
                        return res.status(500).send({ message: 'Error Occured!' });
                    }
                    if (results || results.length != 0) {

                      var query = "insert into chatmessages (GroupId,MessageDescription,CreatedBy)  VALUES  (?,?,?)";
                       db.query(query,[GroupId,MessageDescription,CreatedBy], function (err, result) {
                            if (err) 
                            {
                                console.log('err ',err);
                                CloseDbConnection(db);
                          return  res.status(500).send({ message: 'Error' });
                            }
                        });
                        //..notification sending call
                       // const Notifications = new PushNotifications();
                       // Notifications.SendPushNotification(ReceiverID,"New Message Arrives!");
                       console.log('just before sending');
                      SendPushNotification(ReceiverID,"New Message Arrives!","message");
                        CloseDbConnection(db);
                        return res.status(200).send({ message: 'MessageSent Successfully!' });
                    }else
                    {
                        CloseDbConnection(db);
                    return res.status(200).send({ message: 'Group Doesnt Exist!' });
                    }
                });
            } else {
                let grpname='Direct chat group';
                let grptype='OneToOne';
               // var query1 = "insert into sportsbox.groups (GroupName,CreatedBy,IsDirectChat,GroupType)  VALUES  ('" + grpname + "'," + CreatedBy + ",1,'" + grptype + "')";
              //  db.query(query1, function (error1, results, fields) {
                    var query1 = "insert into sportsbox.groups (GroupName,CreatedBy,IsDirectChat,GroupType)  VALUES  (?,?,?,?)";
                    db.query(query1,[grpname,CreatedBy,1,grptype], function (error1, results, fields) {
                   
                    if (error1) {
                        CloseDbConnection(db);
                        return res.status(500).send({ message: 'Error Occured!' });
                    }
                   
                    if (results && results.length != 0) {
                      
                        //..new

                        if(results && results.insertId)
                        {    let ValuesList=[];          
                             let InnerArray1=[SenderID,results.insertId];
                             let InnerArray2=[ReceiverID,results.insertId];
                             ValuesList.push(InnerArray1);
                             ValuesList.push(InnerArray2);
                         var query = "insert into groupusers (UserId,GroupId)  VALUES  ?";
                         db.query(query,[ValuesList], function (err, result) {
                             if (err)
                             {
                                CloseDbConnection(db);
                              return    res.status(500).send({ message: 'Error' });
                             }
                         });
                      //   var query = 'insert into chatmessages (GroupId,MessageDescription,CreatedBy)  VALUES  (' + results.insertId + ',"' + MessageDescription + '",' + CreatedBy + ')';
                      //   db.query(query, function (err, result) {
                            var query = 'insert into chatmessages (GroupId,MessageDescription,CreatedBy)  VALUES  (?,?,?)';
                            db.query(query,[results.insertId,MessageDescription,CreatedBy], function (err, result) {
                            
                             if (err)
                             {
                                CloseDbConnection(db);
                                  res.status(500).send({ message: 'Error' });
                             }
                         });
                   //..notification sending call
                //   const Notifications = new PushNotifications();
                //   Notifications.SendPushNotification(ReceiverID,"New Message Arrives!");
                   SendPushNotification(ReceiverID,"New Message Arrives!","message");
                   CloseDbConnection(db);
                     return res.status(200).send({ message: 'MessageSent Successfully!',NewGroupID:  results.insertId });
     
                        }

                       //..new

                    }else
                    {
                        CloseDbConnection(db);
                    return res.status(200).send({ message: 'Group Doesnt Exist!' });
                    }
                });

            }

        });
    } catch (err) {
        next();
        CloseDbConnection(db);
        console.log('Exception erro: ', err);
     return   res.status(500).send({ message: 'Error Occurred: ' + err });
    }
});


router.post('/DeleteMessage', function (req, res, next) {
    try {
        connnectDb(function (Error, response) {
            if (Error) {
             return   res.status(500).send({message:'Unabe to Connect to Database'});
            }
            let MessageId = 0;
            if (req.body.MessageId) {
                MessageId = parseInt(req.body.MessageId);
            }
            db = response;
            if (MessageId != 0) {

                db.query('SELECT count(*) as numRows FROM chatmessages where MessageId=' + MessageId, function (error, results, fields) {
                    if (error) 
                    {
                        CloseDbConnection(db);
                    return res.status(500).send({ message:'Error on the server.'});
                    }
                    if (results && results[0] && results[0].numRows) {



                        var query = 'Update chatmessages set IsDeleted=true where MessageId=' + MessageId;
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
                    else
                    {
                        CloseDbConnection(db);
                    return  res.status(200).send({ message: 'No Data Found!' });
                    }
                });





            } else {
                CloseDbConnection(db);
                return res.status(200).send({ message: 'MessageId is missing' });
            }
        });
    } catch (err) {
        next();
        CloseDbConnection(db);
        console.log('exception error: '.err);
      return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
});


router.post('/GetChatMessagesList', function (req, res, next) {

    connnectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });
        var numPerPage = parseInt(req.params.npp, 10) || 10;
        var page = parseInt(req.params.page, 10) || 0;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;

        try {
            var groupId = 0;
            if (!isNaN(req.body.GroupID)) {
                groupId = parseInt(req.body.GroupID);
            }
            db = response;
            db.query('SELECT count(*) as numRows FROM sportsbox.chatmessages chatmsg join sportsbox.users usr on chatmsg.CreatedBy = usr.UserId where chatmsg.GroupId=' + groupId, function (error, results, fields) {
                if (error)
                {
                    CloseDbConnection(db);
                return res.status(500).send({ message: "Error on the server." });
                }
        
                if (results && results[0] && results[0].numRows) {
                    numRows = results[0].numRows;
                    numPages = Math.ceil(numRows / numPerPage);

                     db.query('SELECT Distinct chatmsg.MessageId,chatmsg.MessageDescription,chatmsg.CreatedBy,usr.FirstName,usr.LastName,chatmsg.CreatedAt  FROM sportsbox.chatmessages chatmsg join sportsbox.users usr on chatmsg.CreatedBy = usr.UserId where chatmsg.GroupId=' + groupId + ' Order by chatmsg.MessageId ASC', function (error1, results, fields) {
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
                 return  res.status(200).send({ message: "No Data Found" });
                }
            });


        } catch (err) {
            CloseDbConnection(db);
           return res.status(500).send({ message: 'Error Occurred: ' + err });
          }
    });
});


router.post('/SearchDirectChatUsers', function (req, res, next) {
    connnectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });
        var numPerPage = parseInt(req.params.npp, 10) || 10;
        var page = parseInt(req.params.page, 10) || 0;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;
  try{
  
    let UserName = '';
    let UserId = 0;
    if (req.body.UserId) {
        UserId = parseInt(req.body.UserId);
    }
    if (req.body.UserName) {
        UserName = req.body.UserName;
    }  
        db = response; var arr = [];
     //  db.query('select count(*) as numRows from users u left outer join (select g.groupid, g.groupName, gu.userid, 1 as isGroupExist from sportsbox.groups g inner join sportsbox.groupusers gu on gu.groupid = g.groupid and g.isDirectChat = 1 and gu.userid <> '+UserId+') as grps on grps.UserId = u.userid where u.userid <> '+UserId+' and (u.FirstName like "%'+UserName+'%" or u.LastName like "%'+UserName+'%")', function (error, results, fields) {
        db.query("SELECT count(*) as numRows from users u where (u.FirstName like '%"+UserName+"%' or u.LastName like '%"+UserName+"%') and u.UserId <> "+UserId+" and u.UserId not in (select gu.UserId from sportsbox.groups g inner join sportsbox.groupusers gu on gu.groupid = g.groupid and g.isDirectChat = 1 and gu.GroupId in (select g.groupid from sportsbox.groups g inner join sportsbox.groupusers gu on gu.groupid = g.groupid and g.isDirectChat = 1 and gu.userid = "+UserId+"))", function (error, results, fields) {
         console.log('error ',error);
        if (error) 
        {
            CloseDbConnection(db);
        return res.status(500).send({message:'Error on the server.'});
        }
            if (results && results[0] && results[0].numRows){
                numRows = results[0].numRows;
                numPages = Math.ceil(numRows / numPerPage);
              //  db.query(' select u.userid, u.FirstName,u.LastName,u.City,u.Country,u.State,u.ProfilePicThumb,u.Gender,u.Email,grps.groupid, grps.groupName, not isnull(grps.isGroupExist) as isGroupExist from users u left outer join (select g.groupid, g.groupName, gu.userid, 1 as isGroupExist from sportsbox.groups g inner join sportsbox.groupusers gu on gu.groupid = g.groupid and g.isDirectChat = 1 and gu.userid <> '+UserId+') as grps on grps.UserId = u.userid where u.userid <> '+UserId+' and  (u.FirstName like "%'+UserName+'%" or u.LastName like "%'+UserName+'%") Order by u.userid Desc LIMIT '+ limit, function (error1, results1, fields) {
            }
                db.query("select  u.userid, u.FirstName,u.LastName,u.City,u.Country,u.State,u.ProfilePicThumb,u.Gender,u.Email,'' as groupid,'' as groupName,0 as isGroupExist from users u where (u.FirstName like '%"+UserName+"%' or u.LastName like '%"+UserName+"%') and u.UserId <> "+UserId+" and u.UserId not in (select gu.UserId from sportsbox.groups g inner join sportsbox.groupusers gu on gu.groupid = g.groupid and g.isDirectChat = 1 and gu.GroupId in (select g.groupid from sportsbox.groups g inner join sportsbox.groupusers gu on gu.groupid = g.groupid and g.isDirectChat = 1 and gu.userid = "+UserId+")) union select  u.userid, u.FirstName,u.LastName,u.City,u.Country,u.State,u.ProfilePicThumb,u.Gender,u.Email,g.groupid,g.groupName,1 as isGroupExist from users u left outer join sportsbox.groupusers grps on grps.UserId = u.userid left outer join sportsbox.groups g on grps.GroupId = g.GroupId where (u.FirstName like '%"+UserName+"%' or u.LastName like '%"+UserName+"%') and grps.GroupId in (select g.groupid from sportsbox.groups g inner join sportsbox.groupusers gu on gu.groupid = g.groupid and g.isDirectChat = 1 and gu.userid = "+UserId+") and grps.UserId <> "+UserId, function (error1, results1, fields) {
                    if (error1)
                    {
                        CloseDbConnection(db);
                    return res.status(500).send({message:'Error on the server.2'});  
                    }
                    CloseDbConnection(db);
                  return res.status(200).send(new ResponeModel(numPages,page,results1));
                });
          //  }
          //  else
          // res.status(200).send({message:'No Data Found!'});
        });        
  }catch (err) {
    CloseDbConnection(db);
    console.log('exception error: ', err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
    });
  });






router.post('/GetPersonalGroupsList', function (req, res, next) {
    connnectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });
        var numPerPage = parseInt(req.params.npp, 10) || 10;
        var page = parseInt(req.params.page, 10) || 0;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;

        try {
            let groupType = 'Personal';
            let User_Id = 0;
            if (!isNaN(req.body.UserId)) {
                User_Id = parseInt(req.body.UserId);
            }

            db = response;
            db.query('SELECT count(*) as numRows FROM  sportsbox.groups grp join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId join sportsbox.users usr on grpusr.UserId = usr.UserId and grpusr.UserId=' + User_Id + ' and grpusr.IsDeleted =false where grp.IsDeleted=false and grp.groupType="'+groupType+'"', function (error, results, fields) {
                if (error)
                {
                    CloseDbConnection(db);
                return res.status(500).send({ message: "Error on the server." });
                }

                if (results && results[0] && results[0].numRows) {
                    numRows = results[0].numRows;
                    numPages = Math.ceil(numRows / numPerPage);
                    db.query('SELECT usr.*,grp.* FROM  sportsbox.groups grp join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId join sportsbox.users usr on grpusr.UserId = usr.UserId and grpusr.UserId = ' + User_Id + ' and grpusr.IsDeleted =false where grp.IsDeleted=false and grp.groupType="' + groupType + '" Order by usr.UserId Desc LIMIT ' + limit, function (error1, results, fields) {
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
                  return  res.status(200).send({ message: "No Data Found" });
                }
            });


        } catch (err) {
            CloseDbConnection(db);
            console.log('exception erroe: ', err);
         return   res.status(500).send({ message: 'Error Occurred: ' + err });
          }
    });
});

router.post('/ManagePersonalGroupsById', function (req, res, next) {
    connnectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });
        var numPerPage = parseInt(req.params.npp, 10) || 10;
        var page = parseInt(req.params.page, 10) || 0;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;

        try {
            let User_Id = 0;
            if (!isNaN(req.body.UserId)) {
                User_Id = parseInt(req.body.UserId);
            }
            let Group_Id = 0;
            if (!isNaN(req.body.GroupID)) {
                Group_Id = parseInt(req.body.GroupID);
            }
            console.log('User_Id ', User_Id);
            console.log('Group_Id ', Group_Id);
            db = response;
            db.query('select count(*) as numRows from users u left outer join (select g.groupid, g.groupName, gu.userid, 1 as isGroupExist from sportsbox.groups g inner join sportsbox.groupusers gu on gu.groupid = g.groupid and g.GroupId = '+Group_Id+' and gu.userid <> '+User_Id+') as grps on grps.UserId = u.userid where u.userid <> '+User_Id, function (error, results, fields) {
                if (error)
                {
                    CloseDbConnection(db);
                return res.status(500).send({ message: "Error on the server." });
                }
                if (results && results[0] && results[0].numRows) {
                    numRows = results[0].numRows;
                    numPages = Math.ceil(numRows / numPerPage);
                    db.query('select u.userid, u.FirstName,u.LastName,u.City,u.Country,u.State,u.ProfilePicThumb,grps.groupid, grps.groupName, not isnull(grps.isGroupExist) as isGroupExist from users u left outer join (select g.groupid, g.groupName, gu.userid, 1 as isGroupExist from sportsbox.groups g inner join sportsbox.groupusers gu on gu.groupid = g.groupid and g.GroupId = '+Group_Id+' and gu.userid <> '+User_Id+') as grps on grps.UserId = u.userid where u.userid <> '+User_Id+' Order by grps.UserId Desc,u.FirstName ASC ', function (error1, results, fields) {
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
            console.log('exception error: ',err);
          return  res.status(500).send({ message: 'Error Occurred: ' + err });
          }
    });
});

router.post('/GetLeaguesGroupsList', function (req, res, next) {
     connnectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });
        var numPerPage = parseInt(req.params.npp, 10) || 10;
        var page = parseInt(req.params.page, 10) || 0;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;

        try {
            let groupType = 'Leagues';
            let User_Id = 0;
            if (!isNaN(req.body.UserId)) {
                User_Id = parseInt(req.body.UserId);
            }

            db = response;
            db.query('SELECT count(*) as numRows FROM  sportsbox.groups grp join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId join sportsbox.users usr on grpusr.UserId = usr.UserId and grpusr.UserId =' + User_Id + ' where grp.IsDeleted=false and grp.groupType="'+groupType+'"', function (error, results, fields) {
                if (error)
                {
                    CloseDbConnection(db);
                return res.status(500).send({ message: "Error on the server." });
                }
                if (results && results[0] && results[0].numRows) {
                    numRows = results[0].numRows;
                    numPages = Math.ceil(numRows / numPerPage);
                    db.query('SELECT grp.*,usr.* FROM  sportsbox.groups grp join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId join sportsbox.users usr on grpusr.UserId = usr.UserId and grpusr.UserId =' + User_Id + ' where grp.IsDeleted=false and grp.groupType="' + groupType + '" Order by grp.GroupId Desc LIMIT ' + limit, function (error1, results, fields) {
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
            console.log('exception error: ',err);
          return  res.status(500).send({ message: 'Error Occurred: ' + err });
          }
    });
});

router.post('/GetTeamsGroupsList', function (req, res, next) {
    connnectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });
        var numPerPage = parseInt(req.params.npp, 10) || 10;
        var page = parseInt(req.params.page, 10) || 0;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;

        try {
            let groupType = 'Teams';
            let User_Id = 0;
            if (!isNaN(req.body.UserId)) {
                User_Id = parseInt(req.body.UserId);
            }

            db = response;
            db.query('SELECT count(*) as numRows FROM  sportsbox.groups grp join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId join sportsbox.users usr on grpusr.UserId = usr.UserId and grpusr.UserId =' + User_Id + ' where grp.IsDeleted=false and grp.groupType="'+groupType+'"', function (error, results, fields) {
                if (error)
                {
                    CloseDbConnection(db);
                return res.status(500).send({ message: "Error on the server1." });
                }
                if (results && results[0] && results[0].numRows) {
                    numRows = results[0].numRows;
                    numPages = Math.ceil(numRows / numPerPage);
                    db.query('SELECT grp.*,usr.* FROM  sportsbox.groups grp join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId join sportsbox.users usr on grpusr.UserId = usr.UserId and grpusr.UserId =' + User_Id + ' where grp.IsDeleted=false and grp.groupType="' + groupType + '" Order by grp.GroupId Desc LIMIT ' + limit, function (error1, results, fields) {
                        if (error1)
                        {
                            CloseDbConnection(db);
                        return res.status(500).send({ message: "Error on the server2." });
                        }
                        CloseDbConnection(db);
                      return  res.status(200).send(new ResponeModel(numPages, page, results));
                    });
                }
                else {
                    CloseDbConnection(db);
                  return  res.status(200).send({ message: "No Data Found" });
                }
            });


        } catch (err) {
            CloseDbConnection(db);
            console.log('exception error: ',err);
         return   res.status(500).send({ message: 'Error Occurred: ' + err });
          }
    });
});

router.post('/GetGroupChatMessagesList', function (req, res, next) {

    connnectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });
        var numPerPage = parseInt(req.params.npp, 10) || 10;
        var page = parseInt(req.params.page, 10) || 0;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;

        try {
            var groupId = 0;
            if (!isNaN(req.body.GroupID)) {
                groupId = parseInt(req.body.GroupID);
            }
            db = response;
            db.query('SELECT count(*) as numRows FROM sportsbox.chatmessages chatmsg join sportsbox.users usr on chatmsg.CreatedBy = usr.UserId where chatmsg.GroupId=' + groupId, function (error, results, fields) {
                if (error) 
                {
                    CloseDbConnection(db);
                return res.status(500).send({ message: "Error on the server." });
                }
     
                if (results && results[0] && results[0].numRows) {
                    numRows = results[0].numRows;
                    numPages = Math.ceil(numRows / numPerPage);

                    db.query('SELECT Distinct chatmsg.MessageId,chatmsg.MessageDescription,chatmsg.CreatedBy,usr.FirstName,usr.LastName,usr.ProfilePicThumb,chatmsg.CreatedAt ,grp.GroupName,grp.GroupType ,grp.CreatedBy as GroupCreatorID FROM sportsbox.chatmessages chatmsg join sportsbox.users usr on chatmsg.CreatedBy = usr.UserId join sportsbox.groups grp on chatmsg.GroupId=grp.GroupId where chatmsg.GroupId=' + groupId + ' Order by chatmsg.MessageId ASC ', function (error1, results, fields) {
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
            console.log('exception error: ',err);
        return    res.status(500).send({ message: 'Error Occurred: ' + err });
          }
    });
});

router.post('/DeleteGroup', function (req, res, next) {
    try {
        connnectDb(function (Error, response) {
            if (Error) {
             return   res.status(500).send('Unabe to Connect to Database');
            }
            var GroupId = 0;
            if (req.body.GroupID) {
                GroupId = parseInt(req.body.GroupID);
            }
            db = response;
            if (GroupId != 0) {

                db.query('SELECT count(*) as numRows FROM sportsbox.groups where GroupId=' + GroupId, function (error, results, fields) {
                    if (error) 
                    {
                        CloseDbConnection(db);
                    return res.status(500).send({ message:'Error on the server.'});
                    }
                    if (results && results[0] && results[0].numRows) {



                        var query = 'Update sportsbox.groups set IsDeleted=true where GroupId=' + GroupId;
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
                      return  res.status(200).send({ message: 'No Data Found!' });
                    }
                });





            } else {
                CloseDbConnection(db);
                return res.status(200).send({ message: 'GroupId is missing' });
            }
        });
    } catch (err) {
        next();
        CloseDbConnection(db);
        console.log('exception error: ',err);
      return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
});

router.post('/GetUsersList', function (req, res, next) {

    connnectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });
        var numPerPage = parseInt(req.params.npp, 10) || 10;
        var page = parseInt(req.params.page, 10) || 0;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;

        try {
            var User_Id = 0;
            if (!isNaN(req.body.UserId)) {
                User_Id = parseInt(req.body.UserId);
            }
            db = response; 
            db.query('SELECT count(*) as numRows FROM sportsbox.users where UserId <>'+User_Id, function (error, results, fields) {
                if (error)
                {
                    CloseDbConnection(db);
                return res.status(500).send({ message: "Error on the server." });
                }
                if (results && results[0] && results[0].numRows) {
                    numRows = results[0].numRows;
                    numPages = Math.ceil(numRows / numPerPage);

                    db.query('SELECT * FROM sportsbox.users where UserId<>"'+User_Id+'"  Order by FirstName ASC ', function (error1, results, fields) {
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
                   return res.status(200).send({ message: "No Data Found!" });
               }
            });


        } catch (err) {
            CloseDbConnection(db);
            console.log('exception error: ',err);
          return  res.status(500).send({ message: 'Error Occurred: ' + err });
          }
    });
});


router.post('/SavePersonalGroup', function (req, res, next) {
   try {
        if (!req.body.GroupName || req.body.GroupName == "" || req.body.GroupName == '') {
          return  res.status(500).send({ message: 'GroupName is missing!' });
        }
        if (!req.body.GroupUsers || req.body.GroupUsers == "" || req.body.GroupUsers == ''|| req.body.GroupUsers.length==0) {
         return   res.status(500).send({ message: 'GroupUsers are missing!' });
        }
        connnectDb(function (Error, response) {
            if (Error) {
               return res.status(500).send({message:'Unabe to Connect to Database!'});
            }
            let GroupId = 0;
            let CreatedBy=null;
            if (!isNaN(req.body.CreatedBy)) {
                CreatedBy = parseInt(req.body.CreatedBy);
            }
            if (!isNaN(req.body.GroupId)) {
                GroupId = parseInt(req.body.GroupId);
            }
            db = response;
            let MessageDescription = (req.body.MessageDescription ? req.body.MessageDescription : "");
            if (GroupId != 0) {


                db.query('SELECT * FROM sportsbox.groups Where GroupId=' + GroupId, function (error1, results, fields) {
                    if (error1) {
                        CloseDbConnection(db);
                        return res.status(500).send({ message: 'Error Occured!' });
                    }
                   

                    if (results || results.length != 0) {

                            var query = "insert into chatmessages (GroupId,MessageDescription,CreatedBy)  VALUES  (?,?,?)";
                            db.query(query,[GroupId,MessageDescription,CreatedBy], function (err, result) {
                           
      
                            if (err) 
                            {
                                CloseDbConnection(db);
                            return res.status(500).send({ message: 'Error' });
                            }
                        });
                              SendPushNotificationToGroup(GroupId,"Group has been updated!","message");
                              CloseDbConnection(db);
                        return res.status(200).send({ message: 'MessageSent Successfully!' });
                    }else
                    {
                        CloseDbConnection(db);
                    return res.status(200).send({ message: 'Group Doesnt Exist!' });
                    }
                });
            } else {
                 let GroupName = (req.body.GroupName ? req.body.GroupName : "");
                let UsersList=[];
                UsersList= (req.body.GroupUsers ? req.body.GroupUsers : []);

                    var query1 = "insert into sportsbox.groups (GroupName,CreatedBy,IsDirectChat,GroupType)  VALUES  (?,?,?,?)";
                    db.query(query1,[GroupName,CreatedBy,0,'Personal'], function (error1, results, fields) {
                   
                  
                    if (error1) {
                    CloseDbConnection(db);
                        return res.status(500).send({ message: 'Error Occured!'});
                    }
                   if(results && results.insertId)
                   {                     
                    let ValuesList=[];
                    UsersList.forEach(function(myString)
                    {
                        let InnerArray=[myString,results.insertId];
                        ValuesList.push(InnerArray);
                    }); 
                    var query = "insert into groupusers (UserId,GroupId)  VALUES  ?";
                    db.query(query,[ValuesList], function (err, result) {
                        if (err)
                        {
                            CloseDbConnection(db);
                        return res.status(500).send({ message: 'Error' });
                        }
                    });

                    let WelcomeMessage="Welcome to "+GroupName;
                        var query = 'insert into chatmessages (GroupId,MessageDescription,CreatedBy)  VALUES  (?,?,?)';
                        db.query(query,[results.insertId,WelcomeMessage,CreatedBy], function (err, result) {
                        
                        if (err)
                        {
                            CloseDbConnection(db);
                        return res.status(500).send({ message: 'Error' });
                        }
                    });

                       SendPushNotificationToGroup(results.insertId,"New Group has been created!","message");
                       CloseDbConnection(db);
                return res.status(200).send({ message: 'Group Created Successfully!' });

                   }else
                   {
                    CloseDbConnection(db);
                    return res.status(200).send({ message: 'Group Doesnt Exist!' });
                   }
                });




            }



        });
    } catch (err) {
        next();
        CloseDbConnection(db);
        console.log('exception error: ',err);
        return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
});

router.post('/SendGroupChatMessages', function (req, res, next) {
    try {

        if (!req.body.MessageDescription || req.body.MessageDescription == "" || req.body.MessageDescription == '') {
            res.status(500).send({ message: 'MessageDescription is missing!' });
        }
        connnectDb(function (Error, response) {
            if (Error) {
                res.status(500).send({message:'Unabe to Connect to Database!'});
            }
            let GroupId = 0;
            let CreatedBy=null;
            if (!isNaN(req.body.CreatedBy)) {
                CreatedBy = parseInt(req.body.CreatedBy);
            }
            if (!isNaN(req.body.GroupId)) {
                GroupId = parseInt(req.body.GroupId);
            }
            let MessageDescription = (req.body.MessageDescription ? req.body.MessageDescription : "");
            db = response;

            if (GroupId != 0) {


                db.query('SELECT * FROM sportsbox.groups Where GroupId=' + GroupId, function (error1, results, fields) {
                    if (error1) {
                        CloseDbConnection(db);
                        return res.status(500).send({ message: 'Error Occured!' });
                    }
                    if (results || results.length != 0) {

                     //   var query = "insert into chatmessages (GroupId,MessageDescription,CreatedBy)  VALUES  ('" + GroupId + "','" + MessageDescription + "'," + CreatedBy + ")";
                     //   db.query(query, function (err, result) {
                            var query = "insert into chatmessages (GroupId,MessageDescription,CreatedBy)  VALUES  (?,?,?)";
                            db.query(query,[GroupId,MessageDescription,CreatedBy], function (err, result) {
                          
                            if (err)
                            {
                                CloseDbConnection(db);
                          return  res.status(500).send({ message: 'Error' });
                            }
                            SendPushNotificationToGroup(GroupId,"New message to personal group arrived!","message");
                        });
                        CloseDbConnection(db);
                        return res.status(200).send({ message: 'MessageSent Successfully!' });
                    }
                    CloseDbConnection(db);
                    return res.status(200).send({ message: 'Group Doesnt Exist!' });
                });
            } else
            { CloseDbConnection(db);
                return res.status(200).send({ message: 'GroupID Doesnt Exist!' }); 
            }
        });
    } catch (err) {
        next();
        CloseDbConnection(db);
        console.log('exception error: ',err);
      return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
});


router.post('/UpdatePersonalGroup', function (req, res, next) {
    try {

        if (!req.body.GroupName || req.body.GroupName == "" || req.body.GroupName == '') {
          return  res.status(500).send({ message: 'GroupName is missing!' });
        }

        connnectDb(function (Error, response) {
            if (Error) {
             return   res.status(500).send({message:'Unabe to Connect to Database!'});
            }
            let GroupId = 0;
            let CreatedBy=null;
           
            if (!isNaN(req.body.GroupId)) {
                GroupId = parseInt(req.body.GroupId);
            }
            db = response;
            if (GroupId != 0) {

   let GroupName= (req.body.GroupName?req.body.GroupName:"")
                db.query('SELECT * FROM sportsbox.groups Where GroupId=' + GroupId, function (error1, results, fields) {
                    if (error1) {
                        CloseDbConnection(db);
                       return res.status(500).send({ message: 'Error Occured!' });
                    }
                   

                    if (results && results.length != 0) {
                     
                      //  var query = 'update sportsbox.groups set GroupName="'+GroupName+'" where GroupId=' + GroupId;
                      //  db.query(query, function (err, result) {
                            var query = 'update sportsbox.groups set GroupName=? where GroupId=?';
                            db.query(query,[GroupName,GroupId], function (err, result) {
                            if (err)
                            {
                                CloseDbConnection(db);
                         return   res.status(500).send({ message: 'Error' });
                            }
                        });

                        CloseDbConnection(db);
                        return res.status(200).send({ message: 'Updated Successfully!' });
                    }
                    CloseDbConnection(db);
                    return res.status(200).send({ message: 'Group Doesnt Exist!' });
                });
            } 



        });
    } catch (err) {
        next();
        CloseDbConnection(db);
        console.log('exception error: ',err);
      return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
});


router.post('/AddUserInPersonalGroup', function (req, res, next) {
    try {

        connnectDb(function (Error, response) {
            if (Error) {
             return   res.status(500).send({ message: 'Unabe to Connect to Database!'});
            }
            let GroupId = 0;
            let UserId=0;
           
            if (!isNaN(req.body.GroupId)) {
                GroupId = parseInt(req.body.GroupId);
            }
            if (!isNaN(req.body.UserID)) {
                UserId = parseInt(req.body.UserID);
            }
            db = response;
            if (GroupId != 0 && UserId != 0) {

                db.query('SELECT * FROM sportsbox.groupusers Where UserId='+UserId+' and  GroupId=' + GroupId, function (error1, results, fields) {
                    if (error1) {
                        CloseDbConnection(db);
                       return res.status(500).send({ message: 'Error Occured!' });
                    }
                   


                    if (results && results.length != 0) {
                     
                        if(results[0] && results[0].IsDeleted==true)
                        { var query = 'update sportsbox.groupusers set IsDeleted=false where UserId='+UserId+' and  GroupId=' + GroupId;
     
                        db.query(query, function (err, result) {
      
                            if (err)
                            {
                                CloseDbConnection(db);
                          return  res.status(500).send({ message: 'Error' });
                            }
                        });

                        }else
                        { var query = 'update sportsbox.groupusers set IsDeleted=true where UserId='+UserId+' and GroupId=' + GroupId;
      
                        db.query(query, function (err, result) {
      
                            if (err)
                            {
                                CloseDbConnection(db);
                           return res.status(500).send({ message: 'Error' });
                            }
                        });

                        }
                       
                        CloseDbConnection(db);
                        return res.status(200).send({ message: 'Updated Successfully!' });
                    }else
                    {
                        var query = "insert into groupusers (UserId,GroupId)  VALUES  (" + UserId + "," + GroupId + ")";
                      
                        db.query(query, function (err, result) {
      
                            if (err) 
                            {
                                CloseDbConnection(db);
                           return res.status(500).send({ message: 'Error' });
                            }
                        });
                        CloseDbConnection(db);
                        return res.status(200).send({ message: 'Updated Successfully!' });

                    }

                });
            }else
            {
                CloseDbConnection(db);
                return res.status(200).send({ message: 'GroupID amd UserID are Missing!' });
            }



        });
    } catch (err) {
        next();
        CloseDbConnection(db);
        console.log('exception error: ',err);
      return   res.status(500).send({ message: 'Error Occurred: ' + err });
    }
});



router.post('/SearchLeaguesGroupsList', function (req, res, next) {
    connnectDb(function (Error, response) {
       if (Error) return res.status(500).send({ message: 'Error' });
       var numPerPage = parseInt(req.params.npp, 10) || 10;
       var page = parseInt(req.params.page, 10) || 0;
       var numPages;
       var skip = page * numPerPage;
       // Here we compute the LIMIT parameter for MySQL query
       var limit = skip + ',' + numPerPage;

       try {
           let groupType = 'Leagues';
           let User_Id = 0;
           let SearchText = '';
           if (!isNaN(req.body.UserId)) {
               User_Id = parseInt(req.body.UserId);
           }

           if (req.body.LeagueGroupName) {
            SearchText = req.body.LeagueGroupName;
           }  
           db = response;
           db.query('SELECT count(*) as numRows FROM  sportsbox.groups grp join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId join sportsbox.users usr on grpusr.UserId = usr.UserId and grpusr.UserId =' + User_Id + ' where grp.IsDeleted=false and grp.groupType="'+groupType+'" and grp.GroupName LIKE "%'+SearchText+'%"', function (error, results, fields) {
               if (error)
               {
                CloseDbConnection(db);
               return res.status(500).send({ message: "Error on the server." });
               }
               if (results && results[0] && results[0].numRows) {
                   numRows = results[0].numRows;
                   numPages = Math.ceil(numRows / numPerPage);
                   db.query('SELECT grp.*,usr.* FROM  sportsbox.groups grp join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId join sportsbox.users usr on grpusr.UserId = usr.UserId and grpusr.UserId =' + User_Id + ' where grp.IsDeleted=false and grp.groupType="' + groupType + '" and grp.GroupName LIKE "%'+SearchText+'%" Order by grp.GroupId Desc LIMIT ' + limit, function (error1, results, fields) {
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
                 return  res.status(200).send({ message: "No Data Found" });
               }
           });


       } catch (err) {
        CloseDbConnection(db);
        console.log('exception error: ',err);
        return   res.status(500).send({ message: 'Error Occurred: ' + err });
         }
   });
});



router.post('/SearchTeamsGroupsList', function (req, res, next) {
    connnectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });
        var numPerPage = parseInt(req.params.npp, 10) || 10;
        var page = parseInt(req.params.page, 10) || 0;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;

        try {
            let groupType = 'Teams';
            let User_Id = 0;
            let SearchText = '';
            if (!isNaN(req.body.UserId)) {
                User_Id = parseInt(req.body.UserId);
            }
            if (req.body.TeamGroupName) {
                SearchText = req.body.TeamGroupName;
               }  
            db = response;
            db.query('SELECT count(*) as numRows FROM  sportsbox.groups grp join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId join sportsbox.users usr on grpusr.UserId = usr.UserId and grpusr.UserId =' + User_Id + ' where grp.IsDeleted=false and grp.groupType="'+groupType+'" and grp.GroupName LIKE "%'+SearchText+'%"', function (error, results, fields) {
                if (error)
                {
                    CloseDbConnection(db);
                return res.status(500).send({ message: "Error on the server1." });
                }
                if (results && results[0] && results[0].numRows) {
                    numRows = results[0].numRows;
                    numPages = Math.ceil(numRows / numPerPage);
                    db.query('SELECT grp.*,usr.* FROM  sportsbox.groups grp join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId join sportsbox.users usr on grpusr.UserId = usr.UserId and grpusr.UserId =' + User_Id + ' where grp.IsDeleted=false and grp.groupType="' + groupType + '" and grp.GroupName LIKE "%'+SearchText+'%" Order by grp.GroupId Desc LIMIT ' + limit, function (error1, results, fields) {
                        if (error1)
                        {
                            CloseDbConnection(db);
                        return res.status(500).send({ message: "Error on the server2." });
                        }
                        CloseDbConnection(db);
                      return  res.status(200).send(new ResponeModel(numPages, page, results));
                    });
                }
                else {
                    CloseDbConnection(db);
                  return  res.status(200).send({ message: "No Data Found" });
                }
            });


        } catch (err) {
            CloseDbConnection(db);
            console.log('exception error: ',err);
         return   res.status(500).send({ message: 'Error Occurred: ' + err });
          }
    });
});


router.post('/SearchPersonalGroupsList', function (req, res, next) {
    connnectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });
        var numPerPage = parseInt(req.params.npp, 10) || 10;
        var page = parseInt(req.params.page, 10) || 0;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;

        try {
            let groupType = 'Personal';
            let User_Id = 0;
            let SearchText = '';
            if (!isNaN(req.body.UserId)) {
                User_Id = parseInt(req.body.UserId);
            }
            if (req.body.PersonalGroupName) {
                SearchText = req.body.PersonalGroupName;
               }  
            db = response;
            db.query('SELECT count(*) as numRows FROM  sportsbox.groups grp join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId join sportsbox.users usr on grpusr.UserId = usr.UserId and grpusr.UserId=' + User_Id + ' and grpusr.IsDeleted =false where grp.IsDeleted=false and grp.groupType="'+groupType+'" and grp.GroupName LIKE "%'+SearchText+'%"', function (error, results, fields) {
                if (error)
                {
                    CloseDbConnection(db);
                return res.status(500).send({ message: "Error on the server." });
                }

                if (results && results[0] && results[0].numRows) {
                    numRows = results[0].numRows;
                    numPages = Math.ceil(numRows / numPerPage);
                    db.query('SELECT usr.*,grp.* FROM  sportsbox.groups grp join sportsbox.groupusers grpusr on grp.GroupId = grpusr.GroupId join sportsbox.users usr on grpusr.UserId = usr.UserId and grpusr.UserId = ' + User_Id + ' and grpusr.IsDeleted =false where grp.IsDeleted=false and grp.groupType="' + groupType + '" and grp.GroupName LIKE "%'+SearchText+'%" Order by usr.UserId Desc LIMIT ' + limit, function (error1, results, fields) {
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
                  return  res.status(200).send({ message: "No Data Found" });
                }
            });


        } catch (err) {
            CloseDbConnection(db);
            console.log('exception erroe: ', err);
         return   res.status(500).send({ message: 'Error Occurred: ' + err });
          }
    });
});



module.exports = router;