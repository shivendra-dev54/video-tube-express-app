import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

// common middlewares
app.use(express.json({limit: '32kb'}));
app.use(express.static('public'));
app.use(express.urlencoded({extended: true, limit: '32kb'}));
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(cookieParser());


// importing routes
import healthCheckRoute from "./routes/healthCheck.route.js";
import userRouter from "./routes/user.route.js"
import errorHandler from './middlewares/error.middlewares.js';


// routes
app.use("/api/v1/healthcheck", healthCheckRoute);
app.use("/api/v1/users", userRouter);



// error handler
app.use(errorHandler);

export {app};