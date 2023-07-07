const express = require("express");
require('dotenv').config();
const app = express();
const moment = require('moment');


var con = require("./connection");
const bodyParser= require("body-parser");
var session=require('express-session');

let tasks = [];

app.use(function (req,res,next){
    res.set('Cache-Control','no-cache,private,must-revalidate,no-store');
    next();
})
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized:true
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

 //route

app.get("/",function (req,res){
    res.render("login.ejs");
 });
 
 app.get("/login",function (req,res){
     res.render("login.ejs");
 });
 
 app.post("/login",function (req,res){
     var email= req.body.email;
     var password= req.body.password;
 
     if(email && password){
         var sql="SELECT * FROM user WHERE email=? AND password=?;";
         con.query(sql,[email,password],function (error,results){
             if(results.length>0){
                 req.session.loggedin=true;
                 req.session.email=email;
                 res.redirect("task");
 
             }
             else{
                 res.send("<h1>Incorrect email or password</h1>");
 
             }
         });
     }
     else{
         res.send("<h1>Please enter email or password</h1>");
     }
 });


app.get("/signup",function (req,res){
    res.render("signup.ejs");
 });
 
 app.post("/signup",function(req,res){
 
 var name=req.body.name;
 var email=req.body.email;
 var password=req.body.password;
 var cpassword =req.body.cpassword;
 
 if(password==cpassword){
 
     var sql="INSERT INTO user (Name,Email,Password) values('"+name+"','"+email+"','"+password+"');";
     con.query(sql,function (error,results) {
         if (error) throw error;
 
         res.redirect("/login");
     });
 }
 
 else{
     res.send("<h1>Please confirm your password </h1>")
     }
 
 
 });
/*
app.get("/display",function (req,res){
    res.render("display.ejs")
});
*/ 

app.get("/taskAdd",function (req,res){
    res.render("taskAdd.ejs")
});
app.post("/taskAdd",function(req,res){
    
    var task= req.body.task;
    var time=req.body.time;
    var status='';
    tasks.push(task);

    const now = moment();
    if (moment(time).isAfter(now)) {
        status = 'Upcoming';
    } else if (moment(time).isSameOrBefore(now)) {
        status = 'Pending';
  }


    console.log(task,time);
    var sql = "INSERT into tasks (task,time,status) values ('"+task+"','"+time+"','"+status+"')";
    console.log(sql);

    con.query(sql,[task, time, status],function(err){
        if(err){
            throw err;
        }
        console.log("Data Uploaded Successfully");
        res.redirect("/task");
    })

});

app.get("/task",function(req,res){
    const now = moment();
    var sql = 'SELECT *, CASE ' +
            'WHEN Time > now() THEN "Upcoming" ' +
            'WHEN Time <= now() THEN "Pending" ' +
            'ELSE "Completed" ' +
            'END AS Status ' +
            'FROM tasks';

    con.query(sql,function(error,result){
        if(error) throw error;
        
        
        res.render("task", { tasks: result });
    });
});

app.post("/task/:id/complete", function(req, res) {
    var id = req.params.id;
  
    var sql = 'UPDATE tasks SET status = "Complete" WHERE id = ?';
  
    con.query(sql, [id], function(err, result) {
      if (err) {
        console.log(err);
        res.redirect("/task");
      } else {
        console.log("Task marked as completed");
        res.redirect("/task");
      }
    });
  });

app.get("/updatetaskData",function(req,res){
        var id = req.query.id;
        var sql = 'SELECT * from tasks where id = ?';

        

        con.query(sql,[id],function(error,result){
            if(error) console.log(error);

            res.render('updateTask',{tasks: result});
        })

});

app.post("/updateTaskData",function(req,res){
    var task= req.body.task;
    var time =req.body.time;
    var id = req.body.id;

    console.log(task,time);

    var sql = 'UPDATE tasks set task=?, time=? where id=?';

    con.query(sql,[task,time,id],function(err,result){
        if(err) console.log(err);
        console.log("Data updated");
        res.redirect("/task");
    })
});

app.get("/delete",function(req,res){
    
        
        var id = req.query.id;
        
        var sql = "DELETE from tasks where id=?";


        con.query(sql,[id],function(error,result){
            if(error) console.log(error);
            res.redirect("/task");
        })

});

app.get("/logout",function (req,res){
    req.session.destroy((error)=>{
        res.redirect("/login");
    });
});

var server=app.listen(4500,function (){

    console.log("Server Running");
});