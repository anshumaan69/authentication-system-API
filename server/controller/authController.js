import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodeMailer.js';




//Registration logic
export const register = async(req,res)=>{
    const {name,email,password}=req.body;
    if(!name || !email || !password){
        return res.json({success:false,message:"Missing Details"});
    }
    try {
        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.json({success:false ,message :"User already exists"})

        }
        const hashPassword = await bcrypt.hash(password,10)
        const user =new userModel({name,email,password:hashPassword})
        await user.save();


        const token = jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn:'7d'});



        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite : process.env.NODE_ENV==='production'? 'none':'strict',
            maxAge:7*24*60*60*1000

        })

        const mailOptions={
            from:process.env.SMTP_EMAIL,
            to:email,
            subject:"Welcome to the Authentication app",
            text:`Welcome to the authentication app website.Your account has been created with the email id :${email}  `

        }
        await transporter.sendMail(mailOptions)
        return res.json({success:true})
    } catch (error) {
        res.json({success:false , message :error.message})
        
    }
}



//Login logic
export const login = async(req,res)=>{
    const {email,password}=req.body;


    if(!email||!password){
        return res.json({success:false,message:"Email and Password both are required to log in"})
    }

    try {
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({success:false,message:"User not found"});
        }
        const isMatch =await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({success:false,message:"Password is incorrect"})
        }
        
        const token = jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn:'7d'});



        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite : process.env.NODE_ENV==='production'? 'none':'strict',
            maxAge:7*24*60*60*1000

        })

        return res.json({success:true})
    } catch (error) {
        return res.json({success:false,message:error.message})
        
    }

}




//Logout controller 
export const logout= (req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite : process.env.NODE_ENV==='production'? 'none':'strict',
            maxAge:7*24*60*60*1000

        })
        return res.json({
            success:true,
            message : "Looged Out "
        })
        
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
        
    }
}

//Email verififcation
export const verifyOtp = async (req,res)=>{
    try {
        const {userId} = req.body;
        const user = await userModel.findById(userId);
        if(user.isAccountVerified){
            return res.json({success:false , message:"account already verified"})
        }
        const otp = String(Math.floor(100000+Math.random()*900000));
        user.verifyOtp=otp;
        //1 day expiry
        user.verifyOtpExpireAt=Date.now()+24*60*60*1000;

        await user.save()
        const mailOptions={
            from:process.env.SMTP_EMAIL,
            to:user.email,
            subject:"Account verification OTP",
            text:`The verification atp for your account ${user.email} is ${otp}  `

        }
        await transporter.sendMail(mailOptions)
        return res.json({success:true,message:"Verification otp sent on mail"})
    } catch (error) {
        return res.json({success:false , message : error.message})        
    }
}

//Checking if emailotp == generated otp
export const emailverification = async(req,res)=>{
    const {userId, otp}= req.body; // email is not needed here
    if(!userId || !otp){
        return res.json({success:false,message:"Missing details"})
    }
    try {
        const user = await userModel.findById(userId); // <-- fix here
        if(!user){
            return res.json({success:false,message:"User not found"})
        }
        if (user.verifyOtp === '' || user.verifyOtp != otp){
            return res.json({success:false,message:"Invalid Otp"})
        }
        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success:false,message:"Expired OTP"});
        }
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();
        return res.json({success:true,message:"Email is verified"})
    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}


//At many places we are getting the userID but how is the user going to send the userID when he is only enetering the OTP
//The answer :token which is stored COOKIES
//Now we need a middleware that will get the cookie and from that cookie ....from that cookie it will find the token....
//from that token it will find the userId and then that userID will be added in the req body
