// 1ST DRAFT DATA MODEL
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.set('useNewUrlParser', true); 
mongoose.set('useFindAndModify', false); 
mongoose.set('useCreateIndex', true); 
mongoose.set('useUnifiedTopology', true); 


//users
//use passport-local-mongoose as plug in to add salt & hash
const User = new mongoose.Schema({
  username: {type: String, required: true},
});
User.plugin(passportLocalMongoose); 


//images: [name, url, message, user]
const Image = new mongoose.Schema({
  imgName: {type: String, required: true},
  imgURL: {type: String, required: true},
  imgMessage: {type: String, required: true},
  user: User, //1 image has only 1 user
});

//stories: [ name , [img1, img2] ]
const Story = new mongoose.Schema({
  storyName: String,
  imgList: [Image], 
  user:User,
});


mongoose.model('Image',Image);
mongoose.model('User',User);
mongoose.model('Story',Story);


//insert
// this worked
//db.images.insert({imgName:"cuba building",imgURL:"https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.state.gov%2Fcountries-areas%2Fcuba%2F&psig=AOvVaw16pHWPHCDhrdL4kbmY9_bv&ust=1605834938583000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKjyur23je0CFQAAAAAdAAAAABAJ", imgMessage: "pretty"});
//db.images.insert({imgName:"china",imgURL:"https://www.google.com/url?sa=i&url=https%3A%2F%2Fakisoto.com%2Flijiang-the-most-beautiful-atmospheric-town-in-china%2F&psig=AOvVaw00dQEqlXr8xIUXRn5RYD72&ust=1605835510827000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCMilh9S5je0CFQAAAAAdAAAAABAJ", imgMessage: "china is gorgeous"});

//not worked:how can I insert story?
// db.stories.insert(storyName:"firstStory",imagelist:{ db.images.find({"_id" : ObjectId("5fb5c94a3ef7f439289a29c1") }), db.images.find({   "_id" : ObjectId("5fb5cc5750383e6e49fe58ca")  }) );
// db.stories.insert( storyName:"firstStory",imagelist: [ ObjectId("5fb5c94a3ef7f439289a29c1") , ObjectId("5fb5cc5750383e6e49fe58ca") ]);








