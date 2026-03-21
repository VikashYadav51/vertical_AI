import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './router/user.router.js';
import session from 'express-session';
import passport from 'passport';

const app = express();

const corsOption = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}

const sessionOptions = {
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false,
}


// data parsing
app.use(cors(corsOption))
app.use(express.json({limit : '16kb'}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());



// routes
app.use('/api/v1/auth', authRouter);



// global error handler
app.use((err, req, res, next) =>{
    console.log(`Gobal error is ${err}`)
    res.status(err.statusCode || 500)
    .json({
        success : false,
        message : err.message,
        err : err.error || err,
        stack : err.stack,
    });
});

export default app;
