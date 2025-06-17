import jwt from 'jsonwebtoken';

//after executing the code of this function it will execute the code of next which is a function and next function tells to complete the controller function
const userAuth = async(req,res,next)=>{
    const {token}= req.cookies;
    if(!token){
        return res.json({success:false,message:"Not authorized login again "})
    }
    try {
        const decodedToken =jwt.verify(token,process.env.JWT_SECRET)
        // Ensure req.body is always an object
        if (!req.body) req.body = {};
        if(decodedToken.id){
            req.body.userId=decodedToken.id
        }else{
            return res.json({success:false,message:"Not authorized . Login again"})
        }
        next();
    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}


//So now whenever we will hit this API endpoint this middleWare function will be executed
//It will get the token from the cookie
//It will decode that token 
//From that decoded token it will get the userId 
//thenm this userId will be stored in the req body
//Then it will execute the next function 
//This next function will execute our controller function
export default userAuth;