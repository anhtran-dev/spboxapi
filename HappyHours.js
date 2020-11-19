var express= require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var connectDb = require('./DbConnection');
var ResponeModel = require('./Models/ResponeModel');
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

const CloseDbConnection =require('./common');

var db;

router.post('/GetHappyHoursList', function (req, res, next) {

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
        db.query('SELECT count(*) as numRows FROM happyhours where IsDeleted=false', function (error, results, fields) {

            if (error)
            {
              CloseDbConnection(db);
            return res.status(500).send('Error on the server.');
            }
            if (results && results[0] && results[0].numRows){
                numRows = results[0].numRows;
                numPages = Math.ceil(numRows / numPerPage);

                db.query('SELECT * FROM happyhours where IsDeleted=false Order by HappyHourId  Desc ', function (error1, results, fields) {
     
                  if (error1)
                  {
                    CloseDbConnection(db);
                  return res.status(500).send('Error on the server.'); 
                  }     
                  CloseDbConnection(db);             
                 return   res.status(200).send(new ResponeModel(numPages,page,results));
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

router.post('/ManageHappyHours', function (req, res, next) {
  connectDb(async function (Error, response) {
    if (Error) return res.status(500).send({ message: 'Error' });

    try {
        let HappyHourId =0;
        if(req.body.HappyHourID)
        {
            HappyHourId= parseInt(req.body.HappyHourID);
        }
      db = response;


      if (HappyHourId != 0) {
            db.query('SELECT * FROM happyhours where IsDeleted=false AND HappyHourId='+ HappyHourId, function (error1, results, fields) {

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
          return  res.status(200).send('');
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
      console.log('exception: ',err);
    return  res.status(500).send({ message: 'Error Occurred: ' + err });
    }
  });
});

router.post('/SaveHappyHours', function (req, res, next) {
    try {
  
        if (!req.body.Discount || req.body.Discount == "")
        {
         return   res.status(500).send({message: 'Discount Fields are missing'});
        }
        if (!req.body.IconImage || req.body.IconImage == "" )
        {
         return   res.status(500).send({message: 'IconImage Fields are missing'});
        }
        if (!req.body.PromoInfo || req.body.PromoInfo == "" )
        {
         return   res.status(500).send({message: 'PromoInfo Fields are missing'});
        }
        if (!req.body.PromoName || req.body.PromoName == "" )
        {
         return   res.status(500).send({message: 'PromoName Fields are missing'});
        }
        if (!req.body.ValidThrough || req.body.ValidThrough == "" )
        {
        return    res.status(500).send({message: 'ValidThrough Fields are missing'});
        }
        if (!req.body.CreatedBy || req.body.CreatedBy == "" )
        {
         return   res.status(500).send({message: 'CreatedBy Fields are missing'});
        }
        if (!req.body.City || req.body.City == "" )
        {
        return    res.status(500).send({message: 'City Fields are missing'});
        }
        if (!req.body.ContactNumber || req.body.ContactNumber == "" )
        {
         return   res.status(500).send({message: 'ContactNumber Fields are missing'});
        }
        if (!req.body.Day || req.body.Day == "" )
        {
         return   res.status(500).send({message: 'Day Fields are missing'});
        }
        if (!req.body.EndTime || req.body.EndTime == "" )
        {
        return    res.status(500).send({message: 'EndTime Fields are missing'});
        }
        if (!req.body.StartDate || req.body.StartDate == "" )
        {
         return   res.status(500).send({message: 'StartDate Fields are missing'});
        }
        if (!req.body.StartTime || req.body.StartTime == "" )
        {
         return   res.status(500).send({message: 'StartTime Fields are missing'});
        }
        if (!req.body.State || req.body.State == "" )
        {
        return    res.status(500).send({message: 'State Fields are missing'});
        }

        
      connectDb(function (Error, response) {
        if (Error) {
        return  res.status(500).send('Unabe to Connect to Database');
        }  
        let HappyHourId =0;
        if(req.body.HappyHourID)
        {
            HappyHourId= parseInt(req.body.HappyHourID);
        }
        db = response;

   let Discount = (req.body.Discount ? req.body.Discount : "");
   let IconImage = (req.body.IconImage ? req.body.IconImage : "");
   let PromoInfo = (req.body.PromoInfo ? req.body.PromoInfo : "");
   let PromoName = (req.body.PromoName ? req.body.PromoName : "");
   let ValidThrough = (req.body.ValidThrough ? req.body.ValidThrough : "");
   let CreatedBy = (req.body.CreatedBy ? req.body.CreatedBy : "");
   let City = (req.body.City ? req.body.City : "");
   let ContactNumber = (req.body.ContactNumber ? req.body.ContactNumber : "");
   let Day = (req.body.Day ? req.body.Day : "");
   let EndTime = (req.body.EndTime ? req.body.EndTime : "");
   let StartDate = (req.body.StartDate ? req.body.StartDate : "");
   let StartTime = (req.body.StartTime ? req.body.StartTime : "");
   let State = (req.body.State ? req.body.State : "");


   var d = new Date(ValidThrough);
   var day = d.getDate()
   var monthIndex = d.getMonth();
   var year = d.getFullYear();
       ValidThrough = year +"-"+ monthIndex +"-"+ day;

       d = new Date(StartDate);
       day = d.getDate()
       monthIndex = d.getMonth();
       year = d.getFullYear();
       StartDate = year +"-"+ monthIndex +"-"+ day;


    if(HappyHourId!=0)
   {
  //   var query = 'Update happyhours set Discount ="' + Discount + '",IconImage="' + IconImage + '",PromoInfo="' + PromoInfo + '",PromoName="' + PromoName + '",ValidThrough="' + ValidThrough + '",City="' + City + '",ContactNumber="' + ContactNumber + '",Day="' + Day + '",EndTime="' + EndTime + '",StartDate="' + StartDate + '",StartTime="' + StartTime + '",State="' + State + '" where HappyHourId=' + HappyHourId;
  //   db.query(query, function (err, results) {
      var query = 'Update happyhours set Discount =?,IconImage=?,PromoInfo=?,PromoName=?,ValidThrough=?,City=?,ContactNumber=?,Day=?,EndTime=?,StartDate=?,StartTime=?,State=? where HappyHourId=?';
      db.query(query,[Discount,IconImage,PromoInfo,PromoName,ValidThrough,City,ContactNumber,Day,EndTime,StartDate,StartTime,State,HappyHourId], function (err, results) {
       if (err)
       {
     return  res.status(500).send({ message: 'Error' });
       }
     });
     CloseDbConnection(db);
     return res.status(200).send({ message: 'Success' });
   }else 
  {
  //  var query = "insert into happyhours (Discount,IconImage,PromoInfo,PromoName,ValidThrough,CreatedBy,City,ContactNumber,Day,EndTime,StartDate,StartTime,State)VALUES  ('" + Discount + "','" + IconImage + "','" + PromoInfo + "','" + PromoName + "','" + ValidThrough + "'," + CreatedBy + ",'" + City + "','" + ContactNumber + "','" + Day + "','" + EndTime + "','" + StartDate + "','" + StartTime + "','" + State + "')";
  //  db.query(query, function (err, results) {
      var query = "insert into happyhours (Discount,IconImage,PromoInfo,PromoName,ValidThrough,CreatedBy,City,ContactNumber,Day,EndTime,StartDate,StartTime,State)VALUES  (?,?,?,?,?,?,?,?,?,?,?,?,?)";
      db.query(query,[Discount,IconImage,PromoInfo,PromoName,ValidThrough,CreatedBy,City,ContactNumber,Day,EndTime,StartDate,StartTime,State], function (err, results) {
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
    console.log('exception: ',err);
  return  res.status(500).send({ message: 'Error Occurred: ' + err });
  }
  });

router.post('/DeleteHappyHours', function (req, res, next) {
    try {   
      connectDb(function (Error, response) {
        if (Error) {
          res.status(500).send('Unabe to Connect to Database');
        }  
        let HappyHourId =0;
        if(req.body.HappyHourID)
        {
            HappyHourId= parseInt(req.body.HappyHourID);
        }
        db = response;
    if(HappyHourId!=0)
   {
     var query = 'Update happyhours set IsDeleted =true where HappyHourId='+HappyHourId;
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
   return res.status(500).send({ message: 'Error Occurred: ' + err });
  }
  });



module.exports = router;