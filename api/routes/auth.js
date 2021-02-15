const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
const { registerValidation, loginValidation } = require('../../validation');



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

module.exports = router;
