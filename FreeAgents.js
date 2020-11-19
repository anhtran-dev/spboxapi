var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var connnectDb = require('./DbConnection');
var ResponeModel = require('./Models/ResponeModel');
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

const CloseDbConnection =require('./common');

var db;



router.post('/GetFreeAgentsList', function (req, res, next) {

    connnectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });
        var numPerPage = parseInt(req.params.npp, 10) || 10;
        var page = parseInt(req.params.page, 10) || 0;
        var numPages;
        var skip = page * numPerPage;
        // Here we compute the LIMIT parameter for MySQL query
        var limit = skip + ',' + numPerPage;
try{
    var UserId =0;
    if(!isNaN(req.body.userId))
    {
        UserId= parseInt(req.body.userId);
    }
    console.log('userId ',UserId);
        db = response; 
        db.query("SELECT count(*) as numRows FROM users us left join roles rol on rol.roleid=us.role where rol.RoleName='Game Official'", function (error, results, fields) {
          
            if (error)
            {  CloseDbConnection(db);
                 return res.status(500).send({message:'Error on the server.'});
            }
            if (results && results[0] && results[0].numRows){

                numRows = results[0].numRows;
                numPages = Math.ceil(numRows / numPerPage);
              //  db.query("SELECT us.*,sp.Name as Sports,rol.RoleName FROM users us left join sports sp on us.Game=sp.SportId left join roles rol on us.role=rol.roleid where rol.RoleName='Game Official' Order by us.FirstName ASC LIMIT "+ limit, function (error1, results1, fields) {
                db.query("select distinct us.*,sp.Name as Sports,rol.RoleName,gu.GroupId as ExistingGroup_ID , CASE WHEN isnull(gu.GroupId) <> 0 THEN 0 ELSE 1 END AS AlreadyGroup_Exist from groupusers gu left join users us  on us.UserId  =gu.UserId left join sports sp on us.Game=sp.SportId left join roles rol on us.role=rol.roleid join sportsbox.groups grp on gu.GroupId=grp.GroupId where gu.GroupId in (select distinct GroupId from groupusers where UserId="+UserId+") and gu.UserId <> "+UserId+" and grp.IsDirectChat=true and rol.RoleName='Game Official' union all select distinct usr.*,sp.Name as Sports,rol.RoleName,Null as ExistingGroup_ID , 0 AS AlreadyGroup_Exist From users usr left join sports sp on usr.Game=sp.SportId left join roles rol on usr.role=rol.roleid where  rol.RoleName='Game Official'  and usr.UserId <> "+UserId+" and UserId not in (select userId from groupusers where UserId <> "+UserId+" and groupid in (select distinct gu.groupId from groupusers gu join sportsbox.groups grp on gu.groupId = grp.GroupId where UserId="+UserId+" and grp.IsDirectChat=true ) )  Order by FirstName ASC ", function (error1, results1, fields) {

                    if (error1)
                    {
                        console.log('error1 ',error1);
                        CloseDbConnection(db);
                    return res.status(500).send({message:'Error on the server.'});  
                    }
                    CloseDbConnection(db);
                  return  res.status(200).send(new ResponeModel(numPages,page,results1));
                });
            }
            else
            {
                CloseDbConnection(db);
          return  res.status(200).send({message:'No Data Found!'});
            }
        });        
} catch(err)
{
    CloseDbConnection(db);
 return res.status(500).send({ message: 'Error Occurred: ' + err });
}
    });
});


router.post('/GetPlayerById', function (req, res, next) {
    connnectDb(function (Error, response) {
        if (Error) return res.status(500).send({ message: 'Error' });               
try{
    var userId = parseInt(req.body.userId);
        db = response; var arr = [];   
                db.query('SELECT * FROM users Where UserId='+userId, function (error1, results, fields) {
                    if (error1) 
                    {
                        CloseDbConnection(db);
                    return res.status(500).send({message:'Error on the server.'});
                    }
                    if(results)
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
} catch(err)
{
    CloseDbConnection(db);
    console.log('exception; ',err);
return  res.status(500).send({ message: 'Error Occurred: ' + err });
}
    });
});



module.exports = router;