const { urlencoded } = require('express');
const mongoose = require('mongoose');
const users = mongoose.model('User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// require('dotenv').config()



//what functions do I need
//signup
//add_user
//delete_user
//update_user


const get_users_and_emails = async (req,res) => {
    try {
        const usernames = await users.aggregate([{"$group": {  "_id": null,  "usernames": {"$push": "$username" }},}, ])
        list_of_usernames = usernames[0].usernames
        const emails = await users.aggregate([{"$group": {  "_id": null,  "emails": {"$push": "$email" }},}, ])
        list_of_emails = emails[0].emails
        lis = [list_of_usernames,list_of_emails]
        // console.log(list_of_emails)
        return res.status(200).json(lis)
    } catch (err) {
        return res.status(400).json(err)
    }
}

const view_user = async (req,res) => {
    try {
        specific_user = await users.find({"_id": req.params.userid})
        if (specific_user.length == 0){
            return res.status(404).json({"message":"user not found"})
        }
        return res.status(200).json(specific_user[0])
    } catch (err) {
        return res.status(400).json(err)
    }
}

const login_user = async (req,res) => {
    try {
        specific_user = await users.find({"username":req.body.username})
        if (specific_user.length == 0) {
            const message = {
                worked : false,
                code: 400,
                message:"username does not exist"
            }
            return res.status(400).json({"message":"invalid username"})
        }
        specific_user = specific_user[0]
        const match = await bcrypt.compare(req.body.password,specific_user.encripted_password)
        if (!match){
            return res.status(401).json({"message":"invalid password"})
        }
         //JWT's
        const access_token = jwt.sign(
            {"username": req.body.username},
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1s'}
        );
        const refresh_token = jwt.sign(
            {"username": req.body.username},
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d'}
        );
        res.cookie('jwt_access', access_token, {httpOnly: true, maxAge: 15*60*1000})
        res.cookie('jwt_refresh',refresh_token, {httpOnly: true, maxAge: 24*60*60*1000})
        return res.status(202).json(specific_user)
    }catch (err) {
        console.log('general error')
        return res.status(400).json(err)
    }
}

const add_user = async (req,res) => {
    

    if (req.body.password !== req.body.retyped_password) {
        console.log('hi1')
        return res.status(400).json({"message":"your passwords do not match"})
    }

    if (!req.body.email || !req.body.username) {
        console.log('hi2')
        return res.status(400).json({"message":"please fill out all the fields"})
    }

    specific_user = await users.find({"username":req.body.username})
    if (specific_user.length !== 0){
        console.log('hi3')
        return res.status(400).json({"message":"username already exists"})
    }

    specific_email = await users.find({"email":req.body.email})
    if (specific_email.length !== 0){
        console.log('hi4')
        return res.status(400).json({"message":"email already exists"})
    }

    
    
    try {
        var salt = await bcrypt.genSalt(10);
        const encripted_password = await bcrypt.hashSync(req.body.password,salt)
        const new_user = new users({
            username:req.body.username,
            email:req.body.email,
            encripted_password:encripted_password
        })
        await new_user.save()
        return res.status(200).json(new_user)
    } catch (err){
        return res.status(400).json(err)
    }
}

module.exports = {
    get_users_and_emails,
    view_user,
    login_user,
    add_user
}