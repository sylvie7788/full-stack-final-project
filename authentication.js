const LocalStrategy = require('passport-local').Strategy;
const bcrpyt = require('bcrypt');

//done(err,foundUser,error_message);

function initialize(passport, getUserByEmail){

    const authenticateUser = async (email, password ,done)=>{
        //find user
        const user = getUserByEmail(email);   
        //user not found
        if(user==null){
            return done(null, false, {message: "no user with that email"} );
        }
        //compare password
        try {
            //password match
            if( await bcrpyt.compare(password, user.password)){ 
                return done(null, user);
            //password not match
            }else{
                return done(null, false, {message: "password incorrect"});
            }
        } catch (error) {
            //return error
            return done(error); 
        }
    }

    passport.use( new LocalStrategy({usernameField :"email"}, authenticateUser));

    passport.serializeUser((user,done)=>{ } );
    passport.deserializeUser((id,done)=>{ } );
}

module.exportss ={
    initialize: initialize(),
} 