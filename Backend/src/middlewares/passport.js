/*

    import passport from 'passport';
    import { User } from '../models/user.models.js';
    import { Strategy as LocalStrategy } from 'passport-local';

    const passport_middlewares = passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ $or: [{ email: username }, { fullName: username }] }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.isPasswordCorrect(password)) { return done(null, false); }
        return done(null, user);
        });
    }
    ));


    export default passport_middlewares;

*/

// this code only work when we are taking the username and password in our database....

