require('dotenv').config()
var jwt = require('jsonwebtoken');


const users=require('../validation')
const auth=async(req,res,next)=>{
   try{
          console.log("auth start ")
         // console.log(req.body);  
    
    var token=await req.cookies['shiva'];
           console.log(req.cookies);  
             console.log(token);
         var verifyToken=  await jwt.verify(token,process.env.SECRET_KEY)
          //  console.log(verifyToken)
        const  any = await users.findOne({_id:verifyToken._id});
             req.body=any;
                next();
     }
     catch{
     //  console.log(console.error();)  
     
       req.body=false;
      //  res.send('erro hai while verifing');
       
        next();
     }  
} 
module.exports=auth;