const { urlencoded } = require('express');
const mongoose = require('mongoose');
const users = mongoose.model('User');


//get request
const view_projects = async (req,res) => {
    try {
        const user = await users.findById(req.params.userid)
        if (!user) {
            return res.status(404).json("user does not exist")
        } 
        const projects = user.projects
        res.status(200).json(projects)
    } catch (err){
        res.status(500).json({message: "Server error", error: err})
    }
}

//post request
const create_project = async (req,res) => {
    try {
        const user = await users.findById(req.params.userid)
        if (!user) {
            return res.status(404).json({"message":"user not found"})
        } 
        add_project(req,res,user)
    } catch (err){
        return res.status(400).json(err);
    }
}

//helper function for post request 


const add_project = async (req,res,user) => {
    try {
        const new_loading_training_data = {
            dataset: req.body.dataset,
            batch_size: req.body.loading_batch_size,
            augment: req.body.augment,
            random_seed:req.body.random_seed,
            valid_size:req.body.valid_size,
            shuffle:req.body.shuffle,
            Normalize: {
                mean: [req.body.rmean,req.body.gmean,req.body.bmean],
                std: [req.body.rstd,req.body.gstd,req.body.bstd]
            }
        }
        const new_training_training_data = {
            epoch: req.body.epoch,
            dataset: req.body.dataset,
            batch_size: req.body.training_batch_size,
            learning_rate: req.body.learning_rate,
            weight_decay: req.body.weight_decay,
            momentum: req.body.momentum,
            optimizer: req.body.optimizer,
            criterion: req.body.criterion
        }
        should_not_exist = user.projects.find(project => project.name == req.body.name)
        if (should_not_exist) {
            return res.status(400).json({"message":"you can not make 2 projects with the same name"})
        }
        const new_project = {
            name: req.body.name,
            loading_training_data: new_loading_training_data,
            training_training_data: new_training_training_data
        }
        await user.projects.push(new_project)
        await user.save()
        return res.status(201).json();
    } catch (err){
        return res.status(400).json(err)
    }
}

//helper functions to calculate mean and std
const calculate_means = (string) => {
    return 0
}
const calculate_std = (string) => {
    return 0
}


//delete request
const delete_project = async (req,res) => {
    const user = await users.findById(req.params.userid)
    if (!user){
        return res.status(404).json("user not found")
    }
    try {
        const proj_to_del = await user.projects.findIndex(project => project._id == req.params.projectid)
        if (proj_to_del == -1){
            return res.status(404).json({"message":"project not found"})
        }
        user.projects.splice(proj_to_del,1)
        user.save()
        return res.status(204).json({"message" : "successfully deleted"})
    } catch (err){
        return res.status(400).json(err);
    }
}


//not sure if following are being called anymore, investigate further 

const updates = async (req,res) =>{
    switch (req.body.where){
        case ('project'):
            await update_in_project(req,res)
            break
        case ('layer'):
            await update_out_layer(req,res)
            break
        default:
            return res.status(400).json({"message":"not valid"})
    }
}



const update_project = async (req,res) => {
    try {
        const user = await users.findById(req.params.userid)
        if (!user) {
            return res.status(404).json({"message":"user not found"})
        }
        const thisproject = await user.projects.find(project => project._id == req.params.projectid)
        if (!thisproject) {
            return res.status(404).json({"message":"project not found"})
        }
        thisproject.name = req.body.name


        thisproject.loading_training_data.dataset = req.body.dataset
        thisproject.loading_training_data.batch_size = req.body.loading_batch_size
        thisproject.loading_training_data.augment = req.body.augment
        thisproject.loading_training_data.random_seed = req.body.random_seed
        thisproject.loading_training_data.valid_size = req.body.valid_size
        thisproject.loading_training_data.shuffle = req.body.shuffle


        thisproject.training_training_data.epoch = req.body.epoch
        thisproject.training_training_data.dataset = req.body.dataset
        thisproject.training_training_data.batch_size = req.body.training_batch_size
        thisproject.training_training_data.learning_rate = req.body.learning_rate
        thisproject.training_training_data.weight_decay = req.body.weight_decay
        thisproject.training_training_data.momentum = req.body.momentum
        thisproject.training_training_data.optimizer = req.body.optimizer
        thisproject.training_training_data.criterion = req.body.criterion
        await user.save()
        return res.status(201).json(thisproject)
    }catch (err) {
        return res.status(500).json(err)
    }
}


module.exports = {
    create_project,
    delete_project,
    view_projects,
    update_project,
    updates
}