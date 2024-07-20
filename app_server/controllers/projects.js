var express = require('express');
const { ObjectId } = require('mongodb');
const { stringify } = require('querystring');
const { exec } = require('child_process');
const path = require('path');
var router = express.Router();
// require('dotenv').config()



//functions will get passed to the verification function and thats why headers include an authorization section

const Projects = async (req,res) => {
    try {
        const headers = {
            cookies : JSON.stringify(req.cookies)
        };
        url_to_access_webpage = req.protocol + '://' + req.get('host') + '/api/' + req.params.userid + '/projects'
        const {default: got} = await import('got')
        const response_for_webpage = await got(url_to_access_webpage, {headers: headers});
        const projects = JSON.parse(response_for_webpage.body)

        res.render('viewprojects',{
            userid: req.params.userid,
            projectid: req.params.projectid,
            projects: projects});
    } catch (err) {
        res.render('error')
    }
};


const view_add_project_page = async (req,res) => {
    url = req.protocol + '://' + req.get('host') + '/api/' + req.params.userid + '/projects'
    try {
        const headers = {
            cookies : JSON.stringify(req.cookies)
        };
        const {default: got} = await import('got')
        const response = await got(url,{headers: headers})
        res.render('addproject')
    } catch (error) {
        res.render('error')
    }
}

const add_project = async (req,res) => {
    const {userid} = req.params;
    const form_data = req.body;
    if (form_data.shuffle == 'on') {
        form_data.shuffle = true
    } else if (!form_data.shuffle) {
        form_data.shuffle = false
    }
    if (form_data.augment == 'on') {
        form_data.augment = true
    } else if (!form_data.augment) {
        form_data.augment = false
    }
    try {
        const headers = {
            cookies : JSON.stringify(req.cookies)
        };
        url = req.protocol + '://' + req.get('host') + '/api/' + req.params.userid + '/projects'
        const {default : got} = await import('got')
        const response = await got.post(url, {
            json: form_data,
            headers:headers,
            responseType: 'json'
        });
        console.log('success', response.body)
        res.redirect(`/${userid}/projects`)
    } catch (err) {
        res.render('error')
    }
}

const specific_project = async (req, res) => {
    const url = req.protocol + '://' + req.get('host') + '/api/' + req.params.userid + '/projects/' + req.params.projectid;
    try {
        const headers = {
            cookies : JSON.stringify(req.cookies)
        };
        const {default : got} = await import('got')
        const response = await got(url, {headers:headers});
        const project = JSON.parse(response.body);
        const layers = project.layers
        let max_order = 0;
        var first_layers = []
        for (let layer of layers) {
            max_order = Math.max(max_order, layer.order);
            if (layer.order ==1 ) {
                first_layers.push(layer)
            }
        }
        var max_order_list = []
        for (let i = 1;i <= max_order;i++){
            max_order_list.push(i)
        }
        var layerlist = []
        layerlist[max_order] = 'lmao'
        res.render('viewproject', {
            userid:req.params.userid,
            projectid: req.params.projectid,
            ids: [req.params.userid, req.params.projectid,project.saved_data],
            project: project,
            saved_data: project.saved_data,
            max_order_list: max_order_list,
            max_order: max_order,
            layers: layers,
            layerlist:layerlist,
            first_layers: first_layers
        });
    } catch (error) {
        res.render('error')
        // res.status(500).send('Error fetching project details');
    }
}


const run_python_code = async (req, res) => {
    const url_to_call_api = process.env.API_URL;
    
    const function_key = process.env.FUNCTION_KEY

    const url_to_get_user = req.protocol + '://' + req.get('host') + '/api/' + req.params.userid
    const url_to_handle_data = req.protocol + '://' + req.get('host') + '/api/' + req.params.userid + '/projects/' + req.params.projectid;
    var headers = {
        cookies: JSON.stringify(req.cookies)
    }
    try {
        const {default: got} = await import('got')
        var user = await got(url_to_get_user, {headers: headers})
        user = JSON.parse(user.body)
        username = user.username
    } catch (err) {
        res.render('error')
    }
    if (!req.body.selected_layer_data){
        res.render('error')
    } else {
        try {
            const {default: got} = await import('got')
            var project = await got(url_to_handle_data, {headers: headers})
            project = JSON.parse(project.body)
            var form_data = {
                username: username,
                project_name: project.name,
                layers: req.body.selected_layer_data,
                training: project.training_training_data,
                loading: project.loading_training_data
            };
            const response = await got.post(process.env.FUNCTION_URL, {json: form_data});
            console.log(response.body)
            // res.render('viewproject')
            res.render('index')
        } catch (err) {
            res.render('error')
        }
    }
};


const view_update_project_page = async (req,res) => {

    url = req.protocol + '://' + req.get('host') + '/api/' + req.params.userid + '/projects/' + req.params.projectid 

    try {
        const headers = {
            cookies : JSON.stringify(req.cookies)
        };
        const {default: got} = await import('got')
        const response = await got(url,{headers: headers})
        res.render('updateproject', {
            userid: req.params.userid,
            projectid:req.params.projectid
        })
    } catch (err) {
        res.render('error')
    }
}

const update_project = async (req,res) => {
    const { userid, projectid, layerid } = req.params;
    url = req.protocol + '://' + req.get('host') + '/api/' + req.params.userid + '/projects/' + req.params.projectid
    const form_data = req.body;
    form_data.what = 'change_settings'
    //perhaps give this a better name later 
        if (form_data.shuffle == 'on') {
        form_data.shuffle = true
    } else if (!form_data.shuffle) {
        form_data.shuffle = false
    }
    if (form_data.augment == 'on') {
        form_data.augment = true
    } else if (!form_data.augment) {
        form_data.augment = false
    }
    if (form_data._method == 'PUT') {
      try {
        const {default: got} = await import('got')
        const headers = {
            cookies : JSON.stringify(req.cookies)
        };
        const response = await got.put(url, {
          json: form_data,
          headers: headers,
          responseType: 'json'
        })
        res.redirect(`/${req.params.userid}/projects`)
      } catch (error) {
        res.render('error')
        return res.status(400).json(error)
      }
    }
    if (form_data._method == 'DELETE') {
      try {
        const headers = {
            cookies : JSON.stringify(req.cookies)
        };
        const {default: got} = await import('got')
        const response = await got.delete(url, {headers,headers})
        res.redirect(`/${req.params.userid}/projects`)
      } catch (error) {
        console.log('error',error.response)
        res.render('error')
        return res.status(400).json(error.response)
      }
    }
}

module.exports = {
    Projects,
    specific_project,
    run_python_code,
    view_add_project_page,
    add_project,
    view_update_project_page,
    update_project
}




