const { urlencoded } = require('express');
const mongoose = require('mongoose');
const users = mongoose.model('User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { access } = require('fs');
const { verify } = require('crypto');
// require('dotenv').config();


const verify_JWT = async (req,res,next) => {
    const auth_header = req.headers.authorization || req.headers.Authorization 
    const cookies = JSON.parse(req.headers.cookies)
    console.log(cookies)
    const access_token = cookies.jwt_access
    const refresh_token = cookies.jwt_refresh
    try {
        
        const decoded = await jwt_access.verify(access_token,process.env.ACCESS_TOKEN_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        if (!cookies?.jwt_refresh) return res.status(403).json({"message":"access denied"})
        try {
            await jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET) //will send an error if unable to 
            var specific_user = await users.find({"_id": req.params.userid})
            if (specific_user.length == 0) {
                return res.status(403).json({"message":"access denied"})
            }
            specific_user = specific_user[0]
            const access_token = jwt.sign(
                {"username": specific_user.username},
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '900s'}
            );
            res.cookie('jwt_access', access_token, {httpOnly: true, maxAge: 15^60*1000})
            const decoded = await jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
            req.user = decoded;
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