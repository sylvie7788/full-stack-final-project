//require libraries

const express = require('express');	 
const app = express();
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');	
const passport = require('passport'); 
const LocalStrategy = require("passport-local");
const bodyParser = require("body-parser");
const passportLocalMongoose = require('passport-local-mongoose');
var MongoStore = require('connect-mongodb-session')(session);

//db
require("./db.js");	
const Story = mongoose.model('Story');	
const User = mongoose.model('User');	
const Image = mongoose.model('Image');

app.use(express.static(path.join(__dirname, 'public')));	//serve static file under current folder 
				
app.set("view engine", "hbs"); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/finalP';
}


const connection = mongoose.connect(dbconf);	//use database provided by config.json {dbconf:xxx}

// // need to change dbconf to :
// // {"dbconf": "mongodb://xc1188:PfHxuqjg@class-mongodb.cims.nyu.edu/xc1188"}



const sessionStore = new MongoStore({ 
	uri: dbconf,
	collection:'sessions',	//sessions (mongo)	
});

//save session to mongo
app.use(require("express-session")({ 
	secret: "Rusty is a dog", 
	resave: false, 
	saveUninitialized: false,
	store: sessionStore,
})); 


app.use(passport.initialize()); 
app.use(passport.session()); 

passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 


// Catch errors
sessionStore.on('error', function(error) {
	console.log(error);
  });
   


app.get('/', isLoggedIn, (req, res) => {
	res.redirect('/storybooks');
});


app.get('/storybooks',isLoggedIn, (req, res) => {

	const filter = {};
	if(req.query.storyName){
			filter["storyName"] = req.query.storyName;
			console.log(req.query.storyName);
	}
	Story.find(filter,(err, foundStory)=>{
		const myStories = foundStory.map(obj=>{
			return {
				imgList:  obj.imgList,
				storyName: obj.storyName,
				user: obj.user,
			};
		});
		const context = {
			data: myStories,	
			currentUser: req.user,
		};
		// console.log("req.user:", req.user);
		res.render('storybooks', context);
	});
});



app.get('/allimages', isLoggedIn, (req, res) => {

	const filter = {};
	if(req.query.imgName){
		filter['imgName'] = req.query.imgName;
	}
	Image.find(filter,(err, foundImages)=>{
		const myImagies = foundImages.map(obj=>{
			return {
				imgName: obj.imgName,
				imgURL: obj.imgURL,
				imgMessage: obj.imgMessage,
				user: obj.user,
			}
		});
		context = {
			data: myImagies,
			currentUser: req.user,
		}
		res.render('allimages',context);
	}) 
});


//create get
app.get("/create",isLoggedIn, (req,res)=>{

	const context =  { 
		currentUser: req.user,
		invalidInput: "",
	};
	if(req.query.invalidInput=="true"){
		context["invalidInput"] = "Invalid Input, Try Again!";
	}
	
	res.render('create',context);
});

//create post 
app.post('/create', isLoggedIn,(req, res)=>{

		for( const key in req.body){
			console.log("key",key);
			if(req.body[key]==""){
				res.redirect("/create?invalidInput=true");
			}
		}

		// if(req.body.img1Name==null || req.body.img2Name=="" || req.body.img3Name==""  ){
		// 	res.redirect("/create?invalidInput=true");
		// }else{
			// else if(req.body.img1URL=="")

			//create new img
			const image1 = new Image({
				imgName: req.body.img1Name,
				imgURL:req.body.img1URL,
				imgMessage: req.body.img1Message,
				user: req.user,	//session is set up for user to be in request
			});

			const image2= new Image({
				imgName: req.body.img2Name,
				imgURL:req.body.img2URL,
				imgMessage: req.body.img2Message,
				user: req.user,	//session is set up for user to be in request
			});

			const image3 = new Image({
				imgName: req.body.img3Name,
				imgURL:req.body.img3URL,
				imgMessage: req.body.img3Message,
				user: req.user,	//session is set up for user to be in request
			});


			//save img to db
			image1.save((err,img1)=>{
				console.log("img1: ",img1);
				image2.save((err,img2)=>{
					console.log("img2: ",img2);
					image3.save((err,img3)=>{
						console.log("img3: ",img3);
						const newStory = Story.create({
							storyName: req.body.storyName,
							imgList: [img1, img2, img3],
							user: req.user,
						});
					});
				});
			});

			res.redirect("/mystories");
		// }
		


});

app.get("/mystories",isLoggedIn, (req,res)=>{

	Story.find({user:req.user}, (err,foundStories)=>{	//foundStories -[]
		const myStories = foundStories.map(obj=>{
			return  {
				storyName: obj.storyName,
				imgList: obj.imgList,
				user: obj.user,
			};
		});

		const context = {
			data: myStories,
			currentUser: req.user,
		}
		res.render("myStory", context);
		
		
	})
})



///////////authentication



//register
app.get('/register', isLoggedOut, (req, res)=>{
	context ={
		err: req.query.err,
	}

	res.render('register', context);
});

app.post('/register', isLoggedOut, (req, res)=>{
	//generate new user
	const newuser = new User({ username: req.body.username});	
	//register new user
	User.register( newuser , req.body.password,  (err, user) =>{ 
		if (err) { 
			console.log(err); 
			return res.redirect("register?err="+err); 
		}else{
			passport.authenticate("local")( 
				req, res, function () { 
				console.log("register success!");
				res.redirect("/login"); 
			}); 
		}
	}); 
});


//Showing login form 
app.get("/login", isLoggedOut, function(req, res) { 
	context = {
		failed: req.query.failed,
		notLockedInYet: req.query.notLockedInYet,
	}
	res.render("login", context ); 
}); 

//Handling user login 
app.post("/login", isLoggedOut, passport.authenticate("local", { 
	successRedirect: "/storybooks", 
	failureRedirect: "/login?failed=Log in failed try again!",
})); 

//Handling user logout 
app.get("/logout", function (req, res) { 
	req.logout(); 
	res.render("logout");
}); 



function isLoggedIn(req, res, next) { 
	if (req.isAuthenticated()) return next(); 
	else{
		res.redirect("/login?notLockedInYet=Please Log In Before Proceeding To Other Pages!"); 
	}
} 

function isLoggedOut(req, res, next) { 
	if (!req.isAuthenticated()) return next(); 
	else{
		res.redirect("/storybooks?isLoggedOut=true"); 
	}
} 


// app.listen(3000);
app.listen(process.env.PORT || 3000, ()=>{
	console.log("Server Has Started!"); 
} );
