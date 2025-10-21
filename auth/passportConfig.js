const passport = require("passport");
const LocalStrategy = require("passport-local");
const{ Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const UserModel = require("../models/User");



passport.use(new LocalStrategy(
    {usernameField: "email",
    passwordField: "password"},
    async (email, password, done) => {
        try{
            const user = await UserModel.findOne({"email":email});
            if (!user) return done(null, false, {message:"User not found"});

            const validatePassword = await user.isValidPassword(password)
            if (!validatePassword) return done(null, false, {message:"Wrong password"});

            return done(null, user, {message:"Logged in succesfully"})

        } catch(err){
            return done(err);
        }
    }
    
))

passport.use(new JwtStrategy(
    {
        jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey:process.env.ACCESS_SECRET
    },
    async (payload, done) => {
        try{
            const user = await UserModel.findById(payload.id);

            if (!user) return done(null, false);

            return done(null, user);
        } catch(err){
            return done(err, false)
        }
    }
))

module.exports = passport;