var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();

const add_layer = async (req, res) => {
    const { userid, projectid } = req.params;
    const form_data = req.body;
    console.log(form_data)
    try {
      url = 'http://localhost:3000/api/' + req.params.userid + '/projects/' + req.params.projectid
      const {default : got} = await import('got')
      response = await got.post(url,{
        json: form_data,
        responseType: 'json'
      })
      console.log('success', response.body)
      res.redirect(`/${userid}/projects/${projectid}`);
    } catch (error) {
      console.error('Error handling form submission:', error.response.body);
    }
  };


const specific_layer = async (req,res) => {
    url = 'http://localhost:3000/api/' + req.params.userid + '/projects/' + req.params.projectid + '/layers/' + req.params.layerid
    try {
      const {default : got} = await import('got')
      const response = await got(url)
      const layer = JSON.parse(response.body)
      res.render('updatelayer',{
        userid:req.params.userid,
        projectid:req.params.projectid,
        layerid:req.params.layerid,
        layer:layer
      })
    } catch (err) {
      return res.status(500).json(err)
    }
}

const update_layer = async (req, res) => {
  const { userid, projectid, layerid } = req.params;
  url = 'http://localhost:3000/api/' + req.params.userid + '/projects/' + req.params.projectid + '/layers/' + req.params.layerid
  const form_data = req.body;
  if (form_data._method == 'PUT') {
    try {
      const {default: got} = await import('got')
      const response = await got.put(url, {
        json: form_data,
        responseType: 'json'
      })
      res.redirect(`/${userid}/projects/${projectid}`)
    } catch (error) {
      console.log('error',error.response)
      return res.status(400).json(error.response)
    }
  }
  if (form_data._method == 'DELETE') {
    try {
      const {default: got} = await import('got')
      const response = await got.delete(url)
      res.redirect(`/${userid}/projects/${projectid}`)
    } catch (error) {
      console.log('error',error.response)
      return res.status(400).json(error.response)
    }
  }
};





const view_add_layer_page = async (req,res) => {
    url = 'http://localhost:3000/api/' + req.params.userid + '/projects/' + req.params.projectid
    res.render('addlayer',
        {userid: req.params.userid}
      );
};

module.exports = {
    view_add_layer_page,
    add_layer,
    specific_layer,
    update_layer
}