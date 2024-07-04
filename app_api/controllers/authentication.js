const { urlencoded } = require('express');
const mongoose = require('mongoose');
const users = mongoose.model('User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { access } = require('fs');
const { verify } = require('crypto');
require('dotenv').config();


//figure this out 
const verify_JWT = async (req,res,next) => {
    const auth_header = req.headers.authorization || req.headers.Authorization 
    if (!auth_header) {
        return res.status(401).json({"message":"not found"})
    }
    const token = auth_header.split(' ')[1]
    try {
        // const token = req.headers['authorization'];
        if (!token) {
            return res.status(403).json({ "message": "access denied" });
        }
        const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        const cookies = JSON.parse(req.headers.cookies)
        console.log(cookies)
        if (!cookies?.jwt) return res.status(403).json({"message":"access denied"})
        try {
            await jwt.verify(cookies.jwt, process.env.REFRESH_TOKEN_SECRET) //will send an error if unable to 
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
            specific_user.access_token = access_token
            await specific_user.save()
            const decoded = await jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
            req.user = decoded;
            next()
        } catch {
            console.log("expired")
            return res.status(403).json({"message":"access denied"})
        }
    }
    
}

// const refresh_JWT = (req,res) => {
//     //find user to add access token to it 
//     const cookies = JSON.parse(req.headers.cookies)
//     if (!cookies?.jwt) throw (err)
//     try {
//         jwt.verify(
//             cookies.jwt,
//             process.env.REFRESH_TOKEN_SECRET,
//             async (err,decoded) => {
                
//                 try {
//                     if (err) res.status(403).json({"message":"access denied"})
//                     var specific_user = await users.find({"_id": req.params.userid})
//                     if (specific_user.length == 0) {
//                         return res.status(403).json({"message":"access denied"})
//                     }
//                     specific_user = specific_user[0]
//                     const access_token = jwt.sign(
//                         {"username": specific_user.username},
//                         process.env.ACCESS_TOKEN_SECRET,
//                         { expiresIn: '30s'}
//                     );
//                     specific_user.access_token = access_token
//                     await specific_user.save()
//                 } catch (err){
//                     return res.status(403).json({"message":"access denied"})
//                 }
//             }
//         )
//     } catch (err){
//         return res.status(403).json({"message":"access denied"})
//     }
//     // const refresh_token = cookies.jwt

// }

module.exports = {
    verify_JWT
}