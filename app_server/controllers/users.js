var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();


// Define a route for the home page
login_user_page = (req, res, )  => {
    res.render('loginuser');
};

login_user_credentials = async (req,res) => {
    const form_data = req.body
    url = 'http://localhost:3000/api/login'
    try {
        const {default: got} = await import('got')
        const response = await got.post(url, {
            json:form_data,
            responseType: 'json'
        })
        res.cookie(response.headers['set-cookie'][0])
        res.redirect(`/${response.body._id}/projects`)
    } catch {
        res.status(500).send('Error')
    }
}

signup_user_page = (req,res) =>  {
    res.render('signupuser')
}

signup_user_credentials = async (req,res) => {
    const form_data = req.body
    url = 'http://localhost:3000/api/signup'
    try {
        const {default: got} = await import('got')
        const response = await got.post(url, {
            json:form_data,
            responseType: 'json'
            
        })
        console.log(response.body)
        res.redirect(`/${response.body._id}/projects`)
    } catch (err) {
        res.status(500).send(err)
    }
}

module.exports = {
    login_user_page,
    login_user_credentials,
    signup_user_page,
    signup_user_credentials
}