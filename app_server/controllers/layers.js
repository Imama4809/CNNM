var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();


//functions will get passed to the verification function and thats why headers include an authorization section


const add_layer = async (req, res) => {
    const { userid, projectid } = req.params;
    const form_data = req.body;
    console.log('hi from server')
    console.log(req.body)
    try {
      const headers = {
          cookies : JSON.stringify(req.cookies)
      };
      url = req.protocol + '://' + req.get('host') + '/api/' + req.params.userid + '/projects/' + req.params.projectid
      const {default : got} = await import('got')
      response = await got.post(url,{
        json: form_data,
        headers: headers,
        responseType: 'json'
      })
      console.log('success', response.body)
      res.redirect(`/${userid}/projects/${projectid}`);
    } catch (error) {
      res.render('error')
    }
  };


const specific_layer = async (req,res) => {
    url = req.protocol + '://' + req.get('host') + '/api/' + req.params.userid + '/projects/' + req.params.projectid + '/layers/' + req.params.layerid
    try {
      const headers = {
          cookies : JSON.stringify(req.cookies)
      };
      const {default : got} = await import('got')
      const response = await got(url,{headers: headers})
      const layer = JSON.parse(response.body)
      res.render('updatelayer',{
        userid:req.params.userid,
        projectid:req.params.projectid,
        layerid:req.params.layerid,
        layer:layer
      })
    } catch (err) { 
      res.render('error')
    }
}

const update_layer = async (req, res) => {
  const { userid, projectid, layerid } = req.params;
  url = req.protocol + '://' + req.get('host') + '/api/' + req.params.userid + '/projects/' + req.params.projectid + '/layers/' + req.params.layerid
  const form_data = req.body;
  console.log(form_data)
  if (form_data._method == 'PUT') {
    try {
      const {default: got} = await import('got')
      const headers = {
          cookies : JSON.stringify(req.cookies)
      };
      const response = await got.put(url, {
        json: form_data,
        headers:headers,
        responseType: 'json'
      })
      res.redirect(`/${userid}/projects/${projectid}`)
    } catch (error) {
      // console.log('error',error.response)
      res.render('error')
      return res.status(400).json(error.response)
    }
  }
  if (form_data._method == 'DELETE') {
    try {
      const {default: got} = await import('got')
      const headers = {
          cookies : JSON.stringify(req.cookies)
      };
      const response = await got.delete(url,{headers:headers})
      res.redirect(`/${userid}/projects/${projectid}`)
    } catch (error) {
      console.log('error',error.response)
      res.render('error')
      return res.status(400).json(error.response)
    }
  }
};





const view_add_layer_page = async (req,res) => {
    url = req.protocol + '://' + req.get('host') + '/api/' + req.params.userid + '/projects/' + req.params.projectid
    try {
      const {default: got} = await import('got')
      const headers = {
          cookies : JSON.stringify(req.cookies)
      };
      const response = await got(url, {headers:headers})
    } catch {
      res.render('error')
    }

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