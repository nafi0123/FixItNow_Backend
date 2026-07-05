import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import globalErrorHandler from "./middlewares/globalErrorHandler"; 
const app : Application = express();

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))



app.use("/api/subscription/webhook", express.raw({ type: 'application/json' }))

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());


app.get("/",(req : Request, res : Response) => {
    res.send("Hello, World!");
});

// app.post()

// app.use("/api/users", userRoutes)
// app.use("/api/auth", authRoutes)
// app.use("/api/posts", postRoutes)
// app.use("/api/comments", commentRoutes)
// app.use("/api/subscription", subscriptionRoutes)
// app.use("/api/premium", premiumRoutes)


// app.use((req : Request, res : Response) => {
//     res.status(404).json({
//         message : "Route not found",
//         path : req.originalUrl,
//         date : Date()
//     })
// })


// app.use(notFound)

// app.use((err : any, req : Request, res : Response, next : NextFunction) => {
//     console.log(err);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//         message: err.message,
//         error: err.stack
//     })
// })

app.use(globalErrorHandler)

export default app;