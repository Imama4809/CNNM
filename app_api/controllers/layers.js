const mongoose = require('mongoose');
const users = mongoose.model('User');



const view_project = async (req,res) => {
    try {
        const user = await users.findById(req.params.userid)
        if (!user) {
            return res.status(404).json({"message":"user does not exist"})
        } 
        const thisproject = await user.projects.find(project => project._id == req.params.projectid)
        if (!thisproject){
            return res.status(404).json({"message":"project does not exist"})
        }
        res.status(200).json(thisproject)
    } catch (err){
        res.status(400).json(err)
    }
}


const create_layer = async (req,res) => {
    try {
        //this code is to check for errors when going to the abstraction above the "layer" level
        const user = await users.findById(req.params.userid)
        if (!user) {
            return res.status(404).json({"message":"user not found"})
        }
        const thisproject = user.projects.find(project => project._id == req.params.projectid)
        if (!thisproject){
            return res.status(404).json({"message":"project does not exist"})
        }
        //create if statements and use parameters which are not going to be sent into the database to determine what the layer will look like 
        const thislayer = thisproject.layers.find(layer => layer.name == req.body.name)
        console.log(thislayer)
        if (thislayer !== undefined) {
            return res.status(400).json({"message":"you can not create a layer with the same name as another"})
        }

        const layer_to_add = which_type_of_layer(req,res)
        if (!layer_to_add){
            return res.status(400).json({"message":"layer error"})
        }
        // if (layer_to_add.order != 1) {
        //     const prev_layer = thisproject.layers.find(layer => layer.name == layer_to_add.prev_layer)
        //     if (!prev_layer){
        //         return res.status(404).json({"message": "previous layer has not been found"})
        //     }
        //     // prev_layer.next_layers.push(layer_to_add.name)
        // }
        if (layer_to_add.order != 1) {
            const prev_layer = thisproject.layers.find(layer => layer.order == layer_to_add.order -1)
            if (!prev_layer){
                return res.status(404).json({"message": "You cannot make this layer without making the previous layers"})
            }
            // prev_layer.next_layers.push(layer_to_add.name)
        }

        //this code will be put in place if an update is made (update to only show layers depending on past layer choice)
        try {
            await thisproject.layers.push(layer_to_add)
            await user.save()
            return res.status(200).json(layer_to_add)
        } catch (err) {
            return res.status(400).json(err)
        }
    } catch (err){
        return res.status(400).json(err)
    }

}

const which_type_of_layer = (req,res) => {
    //req.body.S -> sequential
    //this one is strange

    //req.body.C -> convolution
    //req.body.L -> linear
    //req.body.P -> pooling
    //req.body.A -> activation function
    //req.body.B -> Batch_norm
    //req.body.D -> Dropout
    //if any of these are true, then the rest is easy 
    if (req.body.sub_layer == 'Convolutional Layer'){
        sub_layer_to_add = {
            input_depth: req.body.input_depth,
            output_depth: req.body.output_depth,
            kernal_size: req.body.kernal_size,
            stride: req.body.stride,
            padding: req.body.padding,
            batchnorm: req.body.batchnorm,
            activation_function: req.body.activation_function,
        }
        layer_to_add = {
            name: req.body.name,
            sub_layer: req.body.sub_layer,
            conv_layer: sub_layer_to_add,
            prev_layer: req.body.prev_layer,
            order: req.body.order
        }
        return layer_to_add
    }
    else if (req.body.sub_layer == 'Linear Layer'){
        const sub_layer_to_add = {
            input_depth: req.body.input_depth,
            neurons: req.body.neurons,
        }
        const layer_to_add = {
            name: req.body.name,
            sub_layer: req.body.sub_layer,
            lin_layer: sub_layer_to_add,
            prev_layer: req.body.prev_layer,
            order: req.body.order
        }
        return layer_to_add
    }
    else if (req.body.sub_layer == 'Pooling Layer'){
        sub_layer_to_add = {
            pooling_kernal_size: req.body.pooling_kernal_size,
            pooling_padding: req.body.pooling_padding,
            pooling_stride: req.body.pooling_stride
        }
        layer_to_add = {
            name: req.body.name,
            sub_layer: req.body.sub_layer,
            pool_layer: sub_layer_to_add,
            prev_layer: req.body.prev_layer,
            order: req.body.order
        }
        return layer_to_add
    }
    else if (req.body.sub_layer == 'Activation Function'){
        layer_to_add = {
            name: req.body.name,
            sub_layer: req.body.sub_layer,
            activation_function: req.body.activation_function,
            prev_layer: req.body.prev_layer,
            order: req.body.order
        }
        return layer_to_add
    }
    else if (req.body.sub_layer == 'Batch Norm'){
        layer_to_add = {
            name: req.body.name,
            sub_layer: req.body.sub_layer,
            batch_norm: req.body.Batch_norm,
            prev_layer: req.body.prev_layer,
            order: req.body.order
        }
        return layer_to_add
    }
    else if (req.body.sub_layer == 'Dropout '){
        layer_to_add = {
            name: req.body.name,
            sub_layer: req.body.sub_layer,
            dropout: req.params.dropout,
            prev_layer: req.body.prev_layer,
            order: req.body.order
        } 
        return layer_to_add
    }
} 


const delete_layer = async (req,res) => {
    try{
        const user = await users.findById(req.params.userid)
        if (!user) {
            return res.status(404).json({"message":"user not found"})
        }
        const thisproject = await user.projects.find(project => project._id == req.params.projectid)
        if (!thisproject) {
            return res.status(404).json({"message":"project not found"})
        }
        try {
            const layer_to_del = await thisproject.layers.findIndex(layer => layer._id == req.params.layerid)
            if (layer_to_del == -1){
                return res.status(404).json({"message":"layer not found"})
            }
            thisproject.layers.splice(layer_to_del,1)
            user.save()
            return res.status(204).json({"message" : "successfully deleted"})
        } catch (err){
            return res.status(400).json(err)
        }
    } catch (err){
        return res.status(400).json(err)
    }
}

const view_layer = async (req,res) => {
    console.log('hello')
    try {
        //this code is to check for errors when going to the abstraction above the "layer" level
        const user = await users.findById(req.params.userid)
        if (!user) {
            return res.status(404).json({"message":"user not found"})
        }
        console.log(req.params.projectid)
        const thisproject = await user.projects.find(project => project._id == req.params.projectid)
        if (!thisproject){
            return res.status(404).json({"message":"project does not exist"})
        }
        //create if statements and use parameters which are not going to be sent into the database to determine what the layer will look like 
        console.log(req.params.layerid)
        const thislayer = await thisproject.layers.find(layer => layer._id == req.params.layerid)
        if (!thislayer) {
            return res.status(400).json({"message":"layer not found"})
        }
        return res.status(200).json(thislayer)
    } catch (err){
        return res.status(400).json(err)
    }

}

const update_layer = async (req,res) => {
    try {
        const user = await users.findById(req.params.userid)
        if (!user) {
            return res.status(404).json({"message":"user not found"})
        }
        const thisproject = await user.projects.find(project => project._id == req.params.projectid)
        if (!thisproject) {
            return res.status(404).json({"message":"project not found"})
        }
        const thislayer = await thisproject.layers.find(layer => layer._id == req.params.layerid)
        if (!thislayer) {
            return res.status(404).json({"message":"layer not found"})
        }
        thislayer.name = req.body.name
        thislayer.order = req.body.order
        switch (thislayer.sub_layer){
            case ('Convolutional Layer'):
                delete thislayer.conv_layer
                break
            case('Linear Layer'):
                delete thislayer.lin_layer
                break
            case('Pooling Layer'):
                delete thislayer.pool_layer
                break
            case('Activation Function'):
                delete thislayer.activation_function
                break
            case('Batch Norm'):
                delete thislayer.Batch_norm
                break
            case('Dropout'):
                delete thislayer.Dropout
                break
            default:
                return res.status(400).json({"message":"not a valid sub layer"})
        }
        thislayer.sub_layer = req.body.sub_layer
        switch (req.body.sub_layer){
            case ('Convolutional Layer'):
                thislayer.conv_layer.input_depth = req.body.input_depth
                thislayer.conv_layer.output_depth =  req.body.output_depth
                thislayer.conv_layer.kernal_size = req.body.kernal_size
                thislayer.conv_layer.stride = req.body.stride
                thislayer.conv_layer.padding = req.body.padding
                thislayer.conv_layer.batchnorm = req.body.batchnorm
                thislayer.conv_layer.activation_function = req.body.activation_function
                break
            case('Linear Layer'):
                thislayer.lin_layer.input_depth = req.body.input_depth
                thislayer.lin_layer.neurons = req.body.neurons
                break
            case('Pooling Layer'):
                thislayer.pool_layer.pooling_kernal_size = req.body.pooling_kernal_size
                thislayer.pool_layer.pooling_padding = req.body.pooling_padding
                break
            case('Activation Function'):
                thislayer.activation_function = req.body.activation_function
                break
            case('Batch Norm'):
                thislayer.batch_norm = req.params.batch_norm
                break
            case('Dropout'):
                thislayer.dropout = req.params.dropout
                break
            default:
                return res.status(400).json({"message":"not a valid sub layer"})
        }
        await user.save()
        return res.status(201).json(thislayer)
    }catch (err) {
        return res.status(400).json(err)
    }
}


module.exports = {
    create_layer,
    delete_layer,
    view_project,
    view_layer,
    update_layer,
}