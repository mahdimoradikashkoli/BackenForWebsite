const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcript = require("bcrypt");
const jwt=require("jsonwebtoken")
const appRoot=require("app-root-path")

mongoose.connect("mongodb://localhost:27017/banimode");
require("dotenv").config({
  path:appRoot + "/.env"
})

app.use(cors());
app.use(express.json());

const userModel = mongoose.model("users", {
  phoneNumber: String,
  email: String,
  password: String,
  name: String,
});

app.post("/wishlist/register", async (req, res) => {
  try {
    console.log(req.body.agree)
    const { email, phoneNumber, name, password } = req.body;
    if (!email || !phoneNumber || !password ) {
      return res.status(400).json({
        msg: "Please fill in all fields",
      });
    }
    if(!req.body.agree === true) return res.status(400).json({
      msg:'لطفا تیک قوانین را می پذیرم را انتخاب بکنید'
    })
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res
        .status(409)
        .json({ msg: "این ایمیل قبلا ثبت نام کرده است" });
    }
    const hashedPassword = await bcript.hash(req.body.password, 10);
    
    const newUser = new userModel({
      email: email,
      name: name,
      password: hashedPassword,
      phoneNumber: phoneNumber,
    });
    const user = await newUser.save();
    return res.status(200).json({
      msg: "User created successfully",
      user: user,
    });
  } catch (error) {
    console.log("Error in registration", error);
    return res.status(500).json({
      msg: "Error in registration",
    });
  }
});

app.post("/wishlist/login",async(req,res)=>{
console.log(req.body)
const {email,password}=req.body

if(!email || !password) return res.status(400).json({
  msg:"اطلاعات ارسالی ناقص است"
})
const existUser=await userModel.findOne({email:email})
if(!existUser){
  return res.status(401).json({
    msg:"کاربری بااین ایمیل وجود ندارد"
  })
}
const corectPassword=await bcript.compare(password,existUser.password)
if(!corectPassword){
  return res.status(401).json({
    msg:'رمز عبور اشتباه است'
  })
}
const token=await jwt.sign({id:existUser._id},process.env.JWT_SECERETE)
res.status(200).json({
  msg:'login successfuly',
  token:token
})
})
const port =process.env.PORT
console.log(Port)
app.listen(4005, () => {
  console.log("app listening on port 4005");
});
