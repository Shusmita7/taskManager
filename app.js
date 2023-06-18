const express = require("express");
require('dotenv').config();
const app = express();


var con = require("./connection");
const bodyParser= require("body-parser");
var session=require('express-session');

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

// app.get("/", function(req,res){
//     res.render("display.ejs");
// });
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
app.post("/task", function(req,res){
    var task = req.body.task;

    console.log(task);

    var sql = 'INSERT into task (Task) values ?';

    var values =[[task]];

    con.query(sql,[values],function(err,result){
        if (err) throw err;
        console.log("Data Uploaded");

        res.redirect("/task");
    })
})

app.get("/task",function(req,res){
    var sql = 'SELECT * from task';

    con.query(sql,function(error,result){
        if(error) throw error;
        
        res.render("task", { task : result});
    });
});

app.get("/updateTask",function(req,res){
    con.connect(function(error){
        if(error) console.log(error);

        var sql = 'SELECT * from task where id = ?';

        var id = req.query.id;

        con.query(sql,[id],function(error,result){
            if(error) console.log(error);

            res.render('updateTask',{task: result});
        })
    })
})

app.post('/updateTaskData',function(req,res){
    var task= req.body.task;
    var id = req.body.id;

    console.log(task,id);

    var sql = 'UPDATE task set Task=? where id=?';

    con.query(sql,[task,id],function(err,result){
        if(err) console.log(err);
        console.log("Data updated");
        res.redirect("/task");
    })
})

app.get("/delete",function(req,res){
    con.connect(function(err){
        if(err) console.log(err);
        
        var sql = "DELETE from task where id=?";

        var id = req.query.id;

        con.query(sql,[id],function(error,result){
            if(error) console.log(error);
            res.redirect("/task");
        })
    })
})

app.get("/logout",function (req,res){
    req.session.destroy((error)=>{
        res.redirect("/login");
    });
});

var server=app.listen(4500,function (){

    console.log("Server Running");
});