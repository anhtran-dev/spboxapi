var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var bcrypt = require('react-native-bcrypt');
var connectDb = require('./DbConnection');
var ResponeModel = require('./Models/ResponeModel');
var ProfileModel = require('./Models/ProfileModel');
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

const CloseDbConnection = require('./common');


var db;

let JoinedTeams = []; let CreatedTeams = []; let ProfileInfo; let PlayerSportInterests = []; let SportsList = [];let UserMessageGroupInfo = [];let CreatedLeaguesList = [];
router.post('/GetProfileInfo', function (req, res, next) {
  connectDb(async function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });



    try {
      var userId = 0;
      var loggedInUserId = 0;
      if (!isNaN(req.body.UserId)) {
        userId = parseInt(req.body.UserId);
      }
      if (!isNaN(req.body.loggedInUserID)) {
        loggedInUserId = parseInt(req.body.loggedInUserID);
      }
      db = response;

      if (userId != 0) {
        await LoadPlayersTeamsData(userId,loggedInUserId, function (results, error1) {
          res.status(200).send(results);
        })

      }


    } catch (err) {
      res.status(500).send({ message: 'Error Occurred: ' + err });
    }


  });
});

async function LoadPlayersTeamsData(userId,loggedInUserId, callback) {
  let promises = [];
  promises.push(GetProfileTeams('SELECT us.UserId,us.ProfilePic,us.ProfilePicThumb,us.JersyNumber,us.Slogan,us.FirstName,us.LastName,sp.Name as Game,us.WhoAMI,us.HomeTown,us.EmployerName,us.City,us.Slogan,us.DateOfBirth,us.PositionAtWork,us.Role as RoleId,rol.RoleName,us.BirthDateStatus FROM users us left join sports sp on us.Game=sp.SportId left join roles rol on us.Role=RoleId where us.UserId=' + userId, 'ProfileInfo', db));
  promises.push(GetProfileTeams('SELECT * FROM sports', 'SportsList', db));
  promises.push(GetProfileTeams('SELECT usi.*,sp.Name as SportName,sp.SportId FROM usersportsinterests usi left join sports sp on usi.Sports=sp.SportId where usi.UserId=' + userId, 'PlayerSportInterests', db));
  promises.push(GetProfileTeams('SELECT ujt.*,tm.*,sp.Name as SportName,pl.Name as PlayLevelName  FROM usersjoinedteams ujt left join teams tm on tm.TeamId=ujt.TeamId left join sports sp on tm.Sports=sp.SportId left join playlevels pl on tm.PlayLevel=pl.PlayLevelId where ujt.UserId=' + userId, 'JoinedTeams', db));
  promises.push(GetProfileTeams('SELECT tm.*,sp.Name as SportName,pl.Name as PlayLevelName FROM teams tm left join sports sp on tm.Sports=sp.SportId left join playlevels pl on tm.PlayLevel=pl.PlayLevelId where CreatedBy=' + userId, 'CreatedTeams', db));
  promises.push(GetProfileTeams('select g.* from sportsbox.groups g left  join groupusers gu on gu.UserId='+loggedInUserId+' and gu.GroupId=g.GroupId left  join groupusers gu1 on ( gu1.UserId='+userId+') and gu1.GroupId=g.GroupId where g.IsDirectChat=true  and (g.CreatedBy='+loggedInUserId+' or g.CreatedBy='+userId+')  and gu.GroupId=gu1.GroupId', 'UserMessageGroupInfo', db));
  promises.push(GetProfileTeams('select lg.* ,sp.Name as SportName from leagues lg left join sports sp on lg.Sports=sp.SportId  where lg.CreatedBy='+userId  , 'CreatedLeaguesList', db));


  await Promise.all(promises);
  var objModel = new ProfileModel();
  objModel.ProfileInfo = ProfileInfo;
  objModel.SportsList = SportsList;
  objModel.SportsInterests = PlayerSportInterests;
  objModel.JoinedTeamsList = JoinedTeams;
  objModel.CreatedTeamsList = CreatedTeams;
  objModel.UserMessageGroupInfo=UserMessageGroupInfo;
  objModel.CreatedLeaguesList=CreatedLeaguesList;
  await callback(objModel);

};

async function GetProfileTeams(query, type, db) {
  try {

    return new Promise(function (resolve, reject) {

      db.query(query, function (error, results, fields) {
        if (error) {
          reject(new Error('Ooops, something broke!'));
        } else {
          if (type == 'ProfileInfo')
            ProfileInfo = results;
          if (type == 'SportsList')
            SportsList = results;
          if (type == 'PlayerSportInterests')
            PlayerSportInterests = results;
          if (type == 'JoinedTeams')
            JoinedTeams = results;
          if (type == 'CreatedTeams')
            CreatedTeams = results;
            if (type == 'UserMessageGroupInfo')
            UserMessageGroupInfo = results;
            if (type == 'CreatedLeaguesList')
            CreatedLeaguesList = results;
          resolve(results);
        }
      });

    });

  } catch (error) {
  }
};

router.post('/SaveWhoAmiInfo', function (req, res, next) {
  try {


    connectDb(function (Error, response) {
      if (Error) {
        return res.status(500).send({ message: 'Unabe to Connect to Database' });
      }
      var user_Id = 0;
      user_Id = parseInt(req.body.UserID);
      db = response;
      db.query("SELECT * FROM users Where UserId='" + user_Id + "'", function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }
        var FirstName = (req.body.FirstName ? req.body.FirstName : "");
        var LastName = req.body.LastName;
        var WhoAmI = (req.body.WhoAmI ? req.body.WhoAmI : "");
        var HomeTown = (req.body.HomeTown ? req.body.HomeTown : "");
        var PositionAtWork = (req.body.PositionAtWork ? req.body.PositionAtWork : "");
        var DateOfBirth = (req.body.DateOfBirth ? req.body.DateOfBirth : "");
        var Slogan = (req.body.Slogan ? req.body.Slogan : "");
        var Role = req.body.Role;
        var Experience = (req.body.Experience ? req.body.Experience : "");
        var JersySize = (req.body.JersySize ? req.body.JersySize : "");
        var EmployerName = (req.body.EmployerName ? req.body.EmployerName : "");
        var City = (req.body.City ? req.body.City : "");
        var State = (req.body.State ? req.body.State : "");
        var multiSport = (req.body.multiSport ? req.body.multiSport : "");
        var Gender = (req.body.Gender ? req.body.Gender : "");
        var JersyNumber = (req.body.JersyNumber ? req.body.JersyNumber : "");
        var BirthDateStatus=( req.body.BirthDateStatus=='true'?1 : 0);


        let d = new Date(DateOfBirth);
        let day = d.getDate()
        let monthIndex = d.getMonth();
        let year = d.getFullYear();
        DateOfBirth = year + "-" + (monthIndex+1) + "-" + day;


        if (!results || results.length == 0) {
          CloseDbConnection(db);
          return res.status(200).send({ message: 'User Does Not Exisit' });
        } else {
       //   var query = "Update users us  set us.FirstName='" + FirstName + "',us.LastName='" + LastName + "',us.WhoAMI='" + WhoAmI + "',us.HomeTown='" + HomeTown + "',us.PositionAtWork='" + PositionAtWork + "' ,us.DateOfBirth='" + DateOfBirth + "' ,us.Slogan='" + Slogan + "',us.Role='" + Role + "',us.Experience='" + Experience + "',us.JersySize='" + JersySize + "',us.EmployerName='" + EmployerName + "',us.City='" + City + "',us.State='" + State + "',us.MultiSport='" + multiSport + "',us.Gender='" + Gender + "',us.JersyNumber='" + JersyNumber + "' where us.UserId='" + user_Id + "'";
      //    db.query(query, function (err, results) {
            var query = "Update users us  set us.FirstName=?,us.LastName=?,us.WhoAMI=?,us.HomeTown=?,us.PositionAtWork=?,us.DateOfBirth=?,us.Slogan=?,us.Role=?,us.Experience=?,us.JersySize=?,us.EmployerName=?,us.City=?,us.State=?,us.MultiSport=?,us.Gender=?,us.JersyNumber=?,us.BirthDateStatus=? where us.UserId=?";
            db.query(query,[FirstName,LastName,WhoAmI,HomeTown,PositionAtWork,DateOfBirth,Slogan,Role,Experience,JersySize,EmployerName,City,State,multiSport,Gender,JersyNumber,BirthDateStatus,user_Id], function (err, results) {
            if (err) {
              CloseDbConnection(db);
            console.log('its here  ',err);
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
    console.log('exception: ', err);
    return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});

router.post('/SaveUpdatedPassword', function (req, res, next) {
  try {

    if (!req.body.OldPassword || req.body.OldPassword == "" || req.body.OldPassword == '') {
      return res.status(500).send({ message: 'OldPassword is missing!' });
    }
    if (!req.body.NewPassword || req.body.NewPassword == "" || req.body.NewPassword == '') {
      return res.status(500).send({ message: 'NewPassword is missing!' });
    }


    connectDb(function (Error, response) {
      if (Error) {
        return res.status(500).send({ message: 'Unabe to Connect to Database' });
      }
      var user_Id = 0;
      if (!isNaN(req.body.UserID)) {
        user_Id = parseInt(req.body.UserID);
      }
      db = response;
      db.query("SELECT * FROM users Where UserId='" + user_Id + "'", function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }
        var OldPassword = (req.body.OldPassword ? req.body.OldPassword : "");
        var NewPassword = (req.body.NewPassword ? req.body.NewPassword : "");

        if (!results || results.length == 0) {
          CloseDbConnection(db);
          return res.status(200).send({ message: 'User Does Not Exisit' });
        } else {


          passwordComparison(results[0].Password, OldPassword, function (passwordIsValid, err) {

            if (err) {
              CloseDbConnection(db);
              return res.status(500).send({ message: 'Error in Password Comparison.' });
            }
            if (!passwordIsValid) {
              CloseDbConnection(db);
              return res.status(401).send({ auth: false, token: null, message: "Old Password is  InCorrect!" });
            }
            NewPassword = bcrypt.hashSync(NewPassword);
          //  var query = "Update users us  set us.Password='" + NewPassword + "' where us.UserId='" + user_Id + "'";
          //  db.query(query, function (err, results) {
              var query = "Update users us  set us.Password=? where us.UserId=?";
            db.query(query,[NewPassword,user_Id], function (err, results) {
              if (err) {
                CloseDbConnection(db);
                return res.status(500).send({ message: 'Error' });
              }
            });
            CloseDbConnection(db);
            return res.status(200).send({ message: 'Successfully Updated!' });
          });

        }

      });
    });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception: ', err);
    return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});

router.post('/SaveUpdatedRole', function (req, res, next) {
  try {

    if (!req.body.RoleID || req.body.RoleID == "" || req.body.RoleID == '') {
      return res.status(500).send({ message: 'RoleID is missing!' });
    }
    if (!req.body.UserID || req.body.UserID == "" || req.body.UserID == '') {
      return res.status(500).send({ message: 'UserID is missing!' });
    }



    connectDb(function (Error, response) {
      if (Error) {
        res.status(500).send({ message: 'Unabe to Connect to Database' });
      }
      let user_Id = 0;
      let role_Id = 0;
      if (!isNaN(req.body.UserID)) {
        user_Id = parseInt(req.body.UserID);
      }
      if (!isNaN(req.body.RoleID)) {
        role_Id = parseInt(req.body.RoleID);
      }
      db = response;

      db.query("SELECT * FROM users Where UserId='" + user_Id + "'", function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }

        if (!results || results.length == 0) {
          CloseDbConnection(db);
          return res.status(200).send({ message: 'User Does Not Exisit' });
        } else {
          var query = "Update users us  set us.Role='" + role_Id + "' where us.UserId='" + user_Id + "'";

          db.query(query, function (err, results) {
            if (err) {
              CloseDbConnection(db);
              return res.status(500).send({ message: 'Error' });
            }
          });
          CloseDbConnection(db);
          return res.status(200).send({ message: 'Successfully Updated!' });
        }

      });
    });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception: ', err);
    return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});

const passwordComparison = function (dbpassword, paramPassword, callback) {
  var res = bcrypt.compareSync(paramPassword, dbpassword);
  callback(res);
}


router.post('/SaveSportsInterests', function (req, res, next) {
  try {

    connectDb(function (Error, response) {
      if (Error) {
        return res.status(500).send({ message: 'Unabe to Connect to Database!' });
      }
      let UserId = 0;
      if (!isNaN(req.body.UserID)) {
        UserId = parseInt(req.body.UserID);
      }
      db = response;
      ///..new

      if (req.body.SportsIntererestList) {
        req.body.SportsIntererestList.map((currentValue, index) => {

          db.query("SELECT * FROM usersportsinterests Where Sports='" + currentValue.sportsId + "' and UserId=" + UserId, function (error1, results, fields) {
            if (error1) {
              console.log('error1',error1);
            //  CloseDbConnection(db);
             // return res.status(500).send({ message: 'Error' });
            }

            if (!results || results.length == 0) {
             // var query = "insert into usersportsinterests (Sports,Position,Level,SportsSelected,UserId)  VALUES  ('" + currentValue.sportsId + "','" + currentValue.userData.Position + "'," + currentValue.userData.level + "," + currentValue.userData.sportSelected + "," + UserId + ")";
            //  db.query(query, function (err, results) {
                var query = "insert into usersportsinterests (Sports,Position,Level,SportsSelected,UserId)  VALUES  (?,?,?,?,?)";
                db.query(query,[currentValue.sportsId,currentValue.userData.Position,currentValue.userData.level,currentValue.userData.sportSelected,UserId], function (err, results) {
                if (err) {
                  console.log('err 1',err);
                //  CloseDbConnection(db);
                //  return res.status(500).send({ message: 'Error' });
                }
              });

            } else {

           //   var query = "Update usersportsinterests spi  set spi.Position='" + currentValue.userData.Position + "',spi.Level=" + currentValue.userData.level + ",spi.SportsSelected=" + currentValue.userData.sportSelected + " Where spi.Sports='" + currentValue.sportsId + "' and spi.UserId=" + UserId + "";
           //   db.query(query, function (err, results) {
                var query = "Update usersportsinterests spi  set spi.Position=?,spi.Level=?,spi.SportsSelected=? Where spi.Sports=? and spi.UserId=?";
                db.query(query,[currentValue.userData.Position,currentValue.userData.level,currentValue.userData.sportSelected,currentValue.sportsId,UserId], function (err, results) {
                if (err) {
                  console.log('err 2',err);
                //  CloseDbConnection(db);
                //  return res.status(500).send({ message: 'Error' });
                }
              });

            }

          });
        });
       

      }else
      {
        CloseDbConnection(db);
        return res.status(500).send({ message: 'Sports Interest List is Missing!' });
      }


      //..new
     // CloseDbConnection(db);
        return res.status(200).send({ message: 'Updated Successfully!' });


    });
  } catch (err) {
    next();
   // CloseDbConnection(db);
    console.log('exception: ', err);
    return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});


router.post('/SaveProfileImage', function (req, res, next) {
  try {

    if (!req.body.ProfileImage || req.body.ProfileImage == "" || req.body.ProfileImage == '') {
      return res.status(500).send({ message: 'ProfileImage is missing!' });
    }
    if (!req.body.ProfileImageThumb || req.body.ProfileImageThumb == "" || req.body.ProfileImageThumb == '') {
      return res.status(500).send({ message: 'ProfileImageThumb is missing!' });
    }


    connectDb(function (Error, response) {
      if (Error) {
        return res.status(500).send({ message: 'Unabe to Connect to Database' });
      }
      var user_Id = 0;
      user_Id = parseInt(req.body.UserID);
      db = response;
      db.query("SELECT * FROM users Where UserId='" + user_Id + "'", function (error1, results, fields) {
        if (error1) {
          CloseDbConnection(db);
          return res.status(500).send({ message: 'Error' });
        }
        var ProfileImage = (req.body.ProfileImage ? req.body.ProfileImage : "");
        var ProfileImageThumb = (req.body.ProfileImageThumb ? req.body.ProfileImageThumb : "");
        if (!results || results.length == 0) {
          CloseDbConnection(db);
          return res.status(200).send({ message: 'User Does Not Exisit' });
        } else {
       //   var query = "Update users us  set us.ProfilePic='" + ProfileImage + "',us.ProfilePicThumb='" + ProfileImageThumb + "' where us.UserId='" + user_Id + "'";
       //   db.query(query, function (err, results) {
            var query = "Update users us  set us.ProfilePic=?,us.ProfilePicThumb=? where us.UserId=?";
            db.query(query,[ProfileImage,ProfileImageThumb,user_Id], function (err, results) {
            if (err) {
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
    console.log('exception: ', err);
    return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
});



module.exports = router;