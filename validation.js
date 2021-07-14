require('dotenv').config()
const mongoose = require('mongoose');
var jwt=require('jsonwebtoken');
const bcrypt = require('bcrypt');
 
var userschema = new mongoose.Schema(
    {
        username:
        {
            type: String,
            required: true
        },
        email:
        {
            type: String,
            required: true
        },
        password:
        {
            type: String,
            required: true
        },
        confirmPassword:
        {
            type: String,
            required: true
        },
        tokens:[
             
              {
              type:String,
              required:true
              }
             
         ],
         isVerified: {
   type: Boolean
         } ,
         component: [
            { componentName: { type:String,required:true},
              componentTotalSum:{ type:Number},
              componentTotalDay:{type:Number},
              componentPreWork:{type:Number,required:true},
              componentLastUpdatedDate:{ type:Date,required:true},
              compomentImp:{type:Number,required:true},
              componentMessageOfToday: {type:String} 
            }
       ]

    });

 userschema.pre('save', async function (next) {
    try {
    
        this.password = await bcrypt.hash(this.password, 8);
        this.confirmPassword =await bcrypt.hash(this.confirmPassword, 8);
   this.isVerfied=true;
      
         next();
    }
    catch{
        console.log("not hashed ");
        next(error);
    }
}
)
module.exports = mongoose.model("users", userschema);

