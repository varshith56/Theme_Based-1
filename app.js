var express = require("express");
var mongoose = require("mongoose");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var PassportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");
var UserData = require("./models/userdata");
var Orders = require("./models/orders");

mongoose.connect("mongodb://localhost/blood_db",{useNewUrlParser:true});

var app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
    secret: "This is a secret message",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(express.static(__dirname + "/public"));

var urlencodedParser = bodyParser.urlencoded({extended : false});
app.get("/",function(req,res){
    res.render("index");
});

app.post("/",function(req,res){
    var fname = req.body.fname;
    var lname = req.body.lname;
    var address = req.body.address;
    var bloodgroup = req.body.bloodgroup;
    var mobilenumber = req.body.username;
    var data = {fname:fname,lname:lname,address:address,bloodgroup:bloodgroup,mobilenumber:mobilenumber};
    UserData.create(data,function(err,retdata){
            if(err){
                console.log(err);
            }
            else{
                console.log(retdata);
                var newUser = new User({username: req.body.username});
                User.register(newUser, req.body.password, function(err,user){
                if(err){
                    console.log(err);
                }
                else{
                    passport.authenticate("local")(req,res,function(){
                        console.log("redirected");
                        res.render("profile",{id:retdata});
                    });
                }
            });  
        }
    });
});

app.post("/login",passport.authenticate("local",{
    successRedirect: "",
    failureRedirect: "/"
}),function(req,res){
    var mob = req.body.username;
    UserData.findOne({mobilenumber:mob},function(err,founduser){
        if(err){
            console.log(err);
        }
        else{
         console.log(founduser);
         res.render("profile",{id:founduser}); 
        }
    });
});



app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});

app.post("/orders",function(req,res){
    UserData.findOne({ _id: req.body.id },function(err,founduser){
        if(err){
            console.log(err);
        }
        else{
            var neworder = {fname:req.body.fname,mobilenumber:req.body.mobilenumber};
            console.log(neworder);
            Orders.create(neworder,function(err,order){
                if(err){
                    console.log(err);
                }
                else{
                    founduser.orders.push(order);
                    founduser.save();
                    UserData.findOne({_id:req.body.myid},function(err,founduser){
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log(founduser);
                        res.render("profile",{id:founduser});
                        }
                    });
                }
            });
        }
});
});

app.post("/profile/:id/display",function(req,res){
    UserData.find({},function(err,allusers){
        if(err){
            console.log(err);
        }
        else{
            res.render("display",{users:allusers,bg:req.body.bloodgroup,location:req.body.location});
        }
    });
});
app.get("/profile/:id/orders",function(req,res){
    UserData.findById(req.params.id).populate("orders").exec(function(err,founduser){
        if(err){
            console.log(err);
        }
        else{
            //render show template with that campground
            res.render("order",{user:founduser});
        }
    });
});

app.get("/knowMore",function(req, res) {
   res.render("know"); 
});

app.get("/about",function(req, res) {
   res.render("about"); 
});

app.get("/details/a",function(req,res){
  res.render("a");
});

app.get("/details/b",function(req,res){
  res.render("b");
});

app.get("/details/ab",function(req,res){
  res.render("ab");
});

app.get("/details/o",function(req,res){
  res.render("o");
});



app.listen(process.env.PORT,process.env.IP,function(){
    console.log("Server has Started..");
});