import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';//we need to put .js afterwards otherwise there will be an err in the terminal
import {authRouter} from './routes/authRoutes.js'




const app = express();
const PORT = process.env.PORT || 4000;
//If there is a PORT in .env file it will use it otherwise port 4000 will be used
connectDB();


app.use(express.json({extended:false}));
app.use(cookieParser());
app.use(cors({ credentials: true }))
//So that we can use cookies in our application and also use cors to allow cross-origin requests



//API endpoints
app.get("/",(req,res)=>{
    res.send("Welcome to the Authentication app");
})
app.use('/api/auth',authRouter)





app.listen(PORT,()=>{

    console.log(`Server started on port ${PORT}`);
})