var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();

// Define a route for the home page
login_user = (req, res, )  => {
    res.render('loginuser', { userid: 'William' });
};

signup_user = (req,res) =>  {
    res.render('signupuser')
}

module.exports = {
    login_user,
    signup_user
}