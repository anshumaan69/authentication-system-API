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