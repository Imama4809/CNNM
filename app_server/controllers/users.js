var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();


// Define a route for the home page
login_user_page = async (req, res)  => {
    url = req.protocol + '://' + req.get('host') + '/api/login'
    try {
        const {default: got} = await import('got')
        const response = await got(url)
        const users = JSON.parse(response.body)
        res.render('loginuser', {
            users:users
        })
    } catch (err) {
        res.render('error')
    }
    ;
};

login_user_credentials = async (req,res) => {
    const form_data = req.body
    const {default: got} = await import('got')
    url = req.protocol + '://' + req.get('host') + '/api/login'
    try {
        
        const response = await got.post(url, {
            json:form_data,
            responseType: 'json'
        })
        res.cookie(response.headers['set-cookie'][0])
        res.cookie(response.headers['set-cookie'][1])
        res.redirect(`/${response.body._id}/projects`)
    } catch {
        res.status(500).send('Error')
    }   
}

signup_user_page = async (req,res) =>  {
    url = req.protocol + '://' + req.get('host') + '/api/login'
    try {
        const {default: got} = await import('got')
        const response = await got(url)
        const users = JSON.parse(response.body)
        res.render('signupuser', {
            users: users
        })
    } catch (err) {
        res.render('error')
    }
    
}

signup_user_credentials = async (req,res) => {
    const form_data = req.body
    url = req.protocol + '://' + req.get('host') + '/api/signup'
    try {
        const {default: got} = await import('got')
        const response = await got.post(url, {
            json:form_data,
            responseType: 'json'
            
        })
        login_user_credentials(req,res)
        // res.redirect(`/${response.body._id}/projects`)
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