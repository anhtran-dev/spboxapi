var express= require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var connectDb = require('./DbConnection');
var ResponeModel = require('./Models/ResponeModel');
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

const CloseDbConnection =require('./common');

var db;

router.post('/GetFeedsList', function (req, res, next) {

  connectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });
        var numPerPage = parseInt(req.body.npp, 10) || 10;
        var page = parseInt(req.body.page, 10) || 0;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;

try{
  var LogegedInUser =0;
  if(!isNaN(req.body.UserId))
  {
    LogegedInUser= parseInt(req.body.UserId);
  }
        db = response; var arr = [];
        db.query('SELECT count(*) as numRows FROM posts where IsDeleted=false', function (error, results, fields) {
            if (error)
            {
              CloseDbConnection(db);
            return res.status(500).send({message:'Error on the server.'});
            }
            if (results && results[0] && results[0].numRows){
                numRows = results[0].numRows;
                numPages = Math.ceil(numRows / numPerPage);

                db.query('SELECT p.*,us.FirstName,us.LastName,us.city,us.Country,us.State,us.UserId,us.ProfilePicThumb,sp.Name as Sports ,pai.IsPostLiked ,pai.UserId as PostLikedById ,(select count(IsPostLiked) from postsadditionalinfo pi where  pi.PostId=p.PostId and pi.IsPostLiked=true group by pi.IsPostLiked) as LikesTotalCount FROM posts p left join users us on p.CreatedBy=us.UserId left join sports sp on us.Game=sp.SportId left join postsadditionalinfo pai on pai.PostId=p.PostId and pai.IsPostLiked=true and pai.UserId='+LogegedInUser+' where p.IsDeleted=false Order by PostId Desc LIMIT '+ limit, function (error1, results, fields) {
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
            return res.status(200).send({message:'No Data Found!'});
            }
        });        
} catch(err)
{
  CloseDbConnection(db);
  console.log('exception error: ',err);
return  res.status(500).send({ message: 'Error Occurred: ' + err });
}
    });
});

router.get('/GetFeedsById', function (req, res, next) {
    connnectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });               
try{
    var FeedId = parseInt(req.body.FeedId);
        db = response; var arr = [];   
                db.query('SELECT * FROM posts Where FeedId='+FeedId, function (error1, results, fields) {
                    if (error1) 
                    {
                      CloseDbConnection(db);
                    return res.status(500).send({message:'Error on the server.'});
                    }
                    if(results)
                    {
                      CloseDbConnection(db);
                 return   res.status(200).send(results);
                    }
                    else
                    {
                      CloseDbConnection(db);
                   return res.status(200).send({message:'No Result Found'});
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


router.post('/ManageFeeds', function (req, res, next) {
  connectDb(async function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });

    try {
      let FeedId = 0;
      if (!isNaN(req.body.FeedID)) {
        FeedId = parseInt(req.body.FeedID);
      }
      db = response;


      if (FeedId != 0) {
            db.query('SELECT * FROM posts where PostId='+ FeedId, function (error1, results, fields) {

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
           return res.status(200).send({message:'No Result Found'});
            }
            });
      }else
      {
        CloseDbConnection(db);
        return res.status(500).send({ message: 'No Data Found.' });
      } 

    }  catch(err)
    {
      CloseDbConnection(db);
      console.log('exceptin error: '.err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});



router.post('/SaveFeed', function (req, res, next) {
    try {
  
        if (!req.body.whatsOnMind || req.body.whatsOnMind == "")
        {
        return    res.status(500).send({message: 'whatsOnMind Fields are missing'});
        }
        if (!req.body.image || req.body.image == "" )
        {
        return    res.status(500).send({message: 'Required Fields are missing'});
        }

        
      connectDb(function (Error, response) {
        if (Error) {
        return  res.status(500).send({message:'Unabe to Connect to Database'});
        }  
        let FeedId =0;
        if(req.body.FeedId)
        {
          FeedId= parseInt(req.body.FeedId);
        }
        db = response;

   var CreatedBy = (req.body.CreatedBy ? req.body.CreatedBy : "");
   var whatsOnMind = (req.body.whatsOnMind ? req.body.whatsOnMind : "");
   var image = (req.body.image ? req.body.image : "");
  

    if(FeedId!=0)
   {
  //   var query = 'Update posts set whatsOnMind ="' + whatsOnMind + '",image="' + image + '" where PostId=' + FeedId;
  //   db.query(query, function (err, results) {
      var query = 'Update posts set whatsOnMind =?,image=? where PostId=?';
      db.query(query,[whatsOnMind,image,FeedId], function (err, results) {
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
 //   var query = "insert into posts (whatsOnMind,CreatedBy,image)VALUES  ('" + whatsOnMind + "','" + CreatedBy + "','" + image + "')";
 //   db.query(query, function (err, results) {
      var query = "insert into posts (whatsOnMind,CreatedBy,image)VALUES  (?,?,?)";
      db.query(query,[whatsOnMind,CreatedBy,image], function (err, results) {
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
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
  });

  router.post('/DeleteFeed', function (req, res, next) {
    try {   
      connectDb(function (Error, response) {
        if (Error) {
        return  res.status(500).send({message:'Unabe to Connect to Database'});
        }  
        let FeedId =0;
        if(req.body.FeedId)
        {
          FeedId= parseInt(req.body.FeedId);
        }
        db = response;
    if(FeedId!=0)
   {
     var query = 'Update posts set IsDeleted =true where PostId='+FeedId;
     db.query(query, function (err, results) {

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
  return res.status(200).send({ message: 'Data Not Found' });
}
  });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
  });

  router.post('/GetNearByFeedsList', function (req, res, next) {

    connectDb(function (Error, response) {
          if (Error) return res.status(500).send({ message: 'Error' });
          var numPerPage = parseInt(req.params.npp, 10) || 10;
          var page = parseInt(req.params.page, 10) || 0;
          var numPages;
          var skip = page * numPerPage;
          // Here we compute the LIMIT parameter for MySQL query
          var limit = skip + ',' + numPerPage;
  
  try{
    let loggedInUserId =0;
    if(req.body.UserID)
    {
      loggedInUserId= parseInt(req.body.UserID);
    }
          db = response; var arr = [];
          db.query('SELECT count(*) as numRows FROM posts where IsDeleted=false', function (error, results, fields) {
     
              if (error)
              {
                CloseDbConnection(db);
              return res.status(500).send({message:'Error on the server.'});
              }
              if (results && results[0] && results[0].numRows){
                  numRows = results[0].numRows;
                  numPages = Math.ceil(numRows / numPerPage);
  
                  db.query('SELECT p.*,us.FirstName,us.LastName,us.city,us.Country,us.State,us.UserId,us.ProfilePicThumb,sp.Name as Sports FROM posts p left join users us on p.CreatedBy=us.UserId left join sports sp on us.Game=sp.SportId left join users lus on lus.UserId="'+loggedInUserId+'" where p.IsDeleted=false AND lus.State=us.State Order by p.PostId Desc ', function (error1, results, fields) {
 
                    if (error1) 
                    {
                      CloseDbConnection(db);
                    return res.status(500).send('Error on the server.');   
                    }   
                    CloseDbConnection(db);             
                     return res.status(200).send(new ResponeModel(numPages,page,results));
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
    console.log('exception: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
      });
  });


  router.post('/LikeFeed', function (req, res, next) {
    try {   
      connectDb(function (Error, response) {
        if (Error) {
        return  res.status(500).send({message:'Unabe to Connect to Database'});
        }  
        let FeedId =0;
        let UserId =0;
        if(req.body.UserID)
        {
          UserId= parseInt(req.body.UserID);
        }
        if(req.body.FeedId)
        {
          FeedId= parseInt(req.body.FeedId);
        }

        db = response;

    if(FeedId!=0 && req.body.islike)
   {
    console.log('FeedId ',FeedId);
    console.log('req.body.islike ',req.body.islike);
    console.log('UserId ',UserId);
      db.query('SELECT count(*) as numRows FROM postsadditionalinfo where UserId='+UserId+' and PostId=' + FeedId, function (error, results, fields) {

        if (error) 
        {
       //   CloseDbConnection(db);
        return res.status(500).send({message:'Error on the server.'});
        }
        if (results && results[0] && results[0].numRows) {
          var query = 'Update postsadditionalinfo set IsPostLiked='+req.body.islike+' where PostId='+FeedId;
          db.query(query, function (err, results) {

            if (err)
            {
          //    CloseDbConnection(db);
            return res.status(500).send({ message: 'Error' });
            }
          });
         
        }
        else
        {
          var query1 = "insert into postsadditionalinfo (UserId,PostId,IsPostLiked)VALUES  (" + UserId + "," + FeedId + "," + req.body.islike + ")";
          db.query(query1, function (err, results) {

            if (err)
            {
          //    CloseDbConnection(db);
              return res.status(500).send({ message: 'Error' });
            }
          });

        }

        //..for updating counter

   /*      db.query('SELECT count(*) as numRows,LikesCount FROM posts where PostId=' + FeedId, function (error1, result1, fields) {
          if (error1)
          {
            CloseDbConnection(db);
          return res.status(500).send({message:'Error on the server.'});
          }
          if (result1 && result1[0] && result1[0].numRows) {
            let Counter=result1[0].LikesCount;
            if(req.body.islike===true)
            {
              Counter++;
            }else
            {
              if(Counter>0)
              {
              Counter--;
              }
            }
            var query2 = 'Update posts set LikesCount='+Counter+' where PostId='+FeedId;
            db.query(query2, function (err, results) {

              if (err)
              {
                CloseDbConnection(db);
              return res.status(500).send({ message: 'Error' });
              }
            });
           
          }
        }); */
       //..for updating counter
     //  CloseDbConnection(db);
        return res.status(200).send({ message: 'Success' });
      });

     
   }else 
{
 // CloseDbConnection(db);
  return res.status(200).send({ message: 'FeedId & islike is Not Found' });
}
  });
  } catch (err) {
    next();
   // CloseDbConnection(db);
    console.log('exception: ',err);
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
  });

  router.post('/ReportSpam_Feed', function (req, res, next) {
    try {   
      connectDb(function (Error, response) {
        if (Error) {
         return res.status(500).send({message:'Unabe to Connect to Database'});
        }  
        let FeedId =0;
        let UserId =0;
        if(req.body.UserID)
        {
          UserId= parseInt(req.body.UserID);
        }
        if(req.body.FeedId)
        {
          FeedId= parseInt(req.body.FeedId);
        }
        db = response;
    if(FeedId!=0)
   {

      db.query('SELECT count(*) as numRows FROM postsadditionalinfo where PostId=' + FeedId, function (error, results, fields) {

        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({message:'Error on the server.'});
        }
        if (results && results[0] && results[0].numRows) {
          var query = 'Update postsadditionalinfo set IsContentReported=true where PostId='+FeedId;
          db.query(query, function (err, results) {

            if (err)
            {
              CloseDbConnection(db);
            return res.status(500).send({ message: 'Error' });
            }
          });
        }
        else
        {
          var query = "insert into postsadditionalinfo (UserId,PostId,IsContentReported)VALUES  (" + UserId + "," + FeedId + ",true)";
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
      });

     
   }else 
{
  CloseDbConnection(db);
  return res.status(200).send({ message: 'Data Not Found' });
}
  });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
  });

  router.post('/ContentBlocked_Feed', function (req, res, next) {
    try {   
      connectDb(function (Error, response) {
        if (Error) {
        return  res.status(500).send({message:'Unabe to Connect to Database'});
        }  
        let FeedId =0;
        let UserId =0;
        if(req.body.UserID)
        {
          UserId= parseInt(req.body.UserID);
        }
        if(req.body.FeedId)
        {
          FeedId= parseInt(req.body.FeedId);
        }
        db = response;
    if(FeedId!=0)
   {

      db.query('SELECT count(*) as numRows FROM postsadditionalinfo where PostId=' + FeedId, function (error, results, fields) {

        if (error)
        {
          CloseDbConnection(db);
        return res.status(500).send({message:'Error on the server.'});
        }
        if (results && results[0] && results[0].numRows) {
          var query = 'Update postsadditionalinfo set IsContentBlocked=true where PostId='+FeedId;
          db.query(query, function (err, results) {

            if (err)
            {
              CloseDbConnection(db);
            return res.status(500).send({ message: 'Error' });
            }
          });
        }
        else
        {
          var query = "insert into postsadditionalinfo (UserId,PostId,IsContentBlocked)VALUES  (" + UserId + "," + FeedId + ",true)";
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
      });

     
   }else 
{
  CloseDbConnection(db);
  return res.status(200).send({ message: 'Data Not Found' });
}
  });
  } catch (err) {
    next();
    CloseDbConnection(db);
    console.log('exception',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
  });


module.exports = router;