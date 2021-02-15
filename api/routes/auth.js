const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
const { registerValidation, loginValidation } = require('../../validation');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const passwordResetToken = require("../model/resettoken");



//REGISTER

router.post('/register', async (req, res) => {

    //Validate data before creating a user
    const { error } = registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);


    //check if a user already exist in the database
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).send('There is a user with this email');


    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(req.body.password, salt);

    //create a new user
    const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hashedpassword
    });
    try{
        const savedUser = await user.save();
        res.send({ user: user._id });
    } catch (err) {
        res.status(400).send(err);
    }

});

//LOGIN

router.post('/login', async (req, res) => {

    //Validate data brfore creating a user
    const { error } = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    //check if a user already exist in the database
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Email or Password is wrong');

    //password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).send('Email or Password is wrong');


    //create and assign a token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    return res.status(200).json(token);
    
});



//FORGOT PASSWORD

router.post('/forgotpassword', async (req, res) => {
    const email = process.env.MAILER_EMAIL_ID;
  
    if (!req.body.email) {
      return res.status(500).json({ message: "Email is required" });
    }
    const user = await User.findOne({
      email: req.body.email
    });
  
    if (!user) {
      return res.status(409).json({ message: "Email does not exist" });
    }
    var resettoken = new passwordResetToken({
      _userId: user._id,
      resettoken: crypto.randomBytes(16).toString("hex")
    });
  
    resettoken.save(function(err) {
      if (err) {
        return res.status(500).send({ msg: err.message });
      }
      passwordResetToken
        .find({ _userId: user._id, resettoken: { $ne: resettoken.resettoken } })
        .remove()
        .exec();
      res
        .status(200)
        .json({ message: "Check your mail for a Password reset link." });
  
      //Step 1
      const auth = {
        auth: {
          api_key: process.env.api_key,
          domain: process.env.domain
        }
      };
  
      //Step 2
      let transporter = nodemailer.createTransport(mg(auth));
  
      //Step 3
      const mailOptions = {
        from: email,
        to: user.email,
        subject: "Password Reset",
        text:
          "Hello " +
          user.firstname +
          ",\n\n" +
          "You are receiving this mail because you requested for a password reset for your account.\n\n" +
          "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
          "http://localhost:4200/password-reset/" +
          resettoken.resettoken +
          "\n\n" +
          "If you did not request this, please ignore this email and your password will remain unchanged.\n"
      };
  
      //Step 4
      transporter.sendMail(mailOptions, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log("Mail sent!!!");
        }
      });
    });
  });

module.exports = router;
