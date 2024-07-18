const { urlencoded } = require('express');
const mongoose = require('mongoose');
const users = mongoose.model('User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { access } = require('fs');
const { verify } = require('crypto');
// require('dotenv').config();



const verify_JWT = async (req,res,next) => {
    const cookies = JSON.parse(req.headers.cookies)

    const access_token = cookies.jwt_access
    const refresh_token = cookies.jwt_refresh
    if (!refresh_token){
        return res.status(403).json("denied")
    }

    var specific_user = await users.findById(req.params.userid)
    if (!specific_user) {
        return res.status(404).json({"message":"not found"})
    }
    try {

        //first access token verification 
        const decoded = await jwt.verify(access_token,process.env.ACCESS_TOKEN_SECRET)
        req.user = decoded
        if (req.user.username !== specific_user.username){
            return res.status(403).json({"message":"access denied"})
        }
        next()



    } catch (err) {
        //if an error happens with access token then no refresh token return denial
        if (!cookies?.jwt_refresh) return res.status(403).json({"message":"access denied"})

        try {

            //verify refresh token and create new access token if it goes through
            await jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET) //will send an error if unable to 
            const access_token = jwt.sign(
                {"username": specific_user.username},
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '900s'}
            );

            //trying to save cookie COOKIE COOKIE COOKIE 
            res.cookie('jwt_access', access_token, {httpOnly: true, maxAge: 15^60*1000})
            const decoded = await jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
            req.user = decoded;

            //checking to make sure the user is valid for the right access token 
            if (req.user.username !== specific_user.username){
                return res.status(403).json({"message":"access denied"})
            }
            next()


        } catch {
            console.log("expired")
            return res.status(403).json({"message":"access denied"})
        }
    }
    
}

module.exports = {
    verify_JWT
}