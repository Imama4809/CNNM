var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();

const Projects = async (req,res) => {
    url = 'http://localhost:3000/api/' + req.params.userid + '/projects'
    const params = {}
    const {default : got} = await import('got')
    const response = await got(url,params)
    const projects = JSON.parse(response.body)

    res.render('viewprojects',{
        userid: req.params.userid,
        projects: projects});
};


const view_add_project_page = async (req,res) => {
    res.render('addproject')
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
        url = 'http://localhost:3000/api/' + req.params.userid + '/projects'
        const {default : got} = await import('got')
        const response = await got.post(url, {
            json: form_data,
            responseType: 'json'
        });
        console.log('success', response.body)
        res.redirect(`/${userid}/projects`)
    } catch (err) {
        console.error('Error handling form submission:', err.response.body);
    }
}

const specific_project = async (req, res) => {
    const url = 'http://localhost:3000/api/' + req.params.userid + '/projects/' + req.params.projectid;
    const params = {};
    try {
        const {default : got} = await import('got')
        const response = await got(url, params);
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
            projectid: req.params.projectid,
            ids: [req.params.userid, req.params.projectid],
            project: project,
            max_order_list: max_order_list,
            max_order: max_order,
            layers: layers,
            layerlist:layerlist,
            first_layers: first_layers
        });
    } catch (error) {
        res.status(500).send('Error fetching project details');
    }
}


const view_update_project_page = (req,res) => {
    //need a get request 
    res.render('updateproject', {
        userid: req.params.userid,
        projectid:req.params.projectid
    })
}

const update_project = async (req,res) => {
    const { userid, projectid, layerid } = req.params;
    url = 'http://localhost:3000/api/' + req.params.userid + '/projects/' + req.params.projectid
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
    if (form_data._method == 'PUT') {
      try {
        const {default: got} = await import('got')
        const response = await got.put(url, {
          json: form_data,
          responseType: 'json'
        })
        res.redirect(`/${req.params.userid}/projects`)
      } catch (error) {
        return res.status(400).json(error)
      }
    }
    if (form_data._method == 'DELETE') {
      try {
        const {default: got} = await import('got')
        const response = await got.delete(url)
        res.redirect(`/${req.params.userid}/projects`)
      } catch (error) {
        console.log('error',error.response)
        return res.status(400).json(error.response)
      }
    }
}

module.exports = {
    Projects,
    specific_project,
    view_add_project_page,
    add_project,
    view_update_project_page,
    update_project
}
