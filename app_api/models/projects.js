const mongoose = require('mongoose')


const lin_layer_schema = new mongoose.Schema({
    order: Number,

    input_depth: Number,
    neurons: Number,
    //data related to lin layer
    prev_connection : String
    //for knowing which order to put stuff in 

});

const conv_layer_schema = new mongoose.Schema({
    order: Number,

    input_depth: Number,
    output_depth: Number,
    kernal_size: Number,
    stride: Number,
    padding: Number,
    //data related to conv layer
    prev_connection: String
    //for knowing which order to put stuff in 
})

const max_pool_schema = new mongoose.Schema({
    order: Number,

    pooling_kernal_size: Number,
    pooling_padding: Number,
    //data related to pooling
    prev_connection: String
    //for knowing which order to put stuff in 

})

//everything above this are the "building blocks" for making CNN's


const sequential_schema = new mongoose.Schema({
    conv_layers: [conv_layer_schema],
    lin_layers: [lin_layer_schema],
    pool_layers: [max_pool_schema],
    activation_function: {
        type: String,
        order: Number
    },
    Batch_norm: {
        type: String,
        order: Number
    },
    Dropout: {
        type: String,
        order: Number
    },
    prev_connection: String
    //knowing which order to put stuff in
})

//in CNN's sometimes you want a sequential layer, this is that



const layers_schema = new mongoose.Schema({
    name: String,

    order: Number,
    next_layers:[String],
    prev_layer: String,
    sub_layer: String,
    //upon creation of a layer with order number other than one, go back through the data and update the next layer values

    //only ONE of the following should exist in a layer 
    //seq_layers: sequential_schema,
    conv_layer: conv_layer_schema,
    lin_layer: lin_layer_schema,
    pool_layer: max_pool_schema,
    activation_function: String,
    Batch_norm: Number,
    Dropout: Number

})

//this is the overall layer, and includes a seq layer as well as whats inside of a seq layer
//this is to allow layers to be sequential or just one of the parts that can make up a seq layer 

const loading_training_data_schema = new mongoose.Schema({
    dataset: String,
    batch_size: Number,
    augment: Boolean,
    random_seed: Number,
    valid_size: Number,
    shuffle: Boolean,
    Normalize: {
        mean: [Number],
        std: [Number]
    }

})

const training_training_data_schema = new mongoose.Schema({
    epoch: String,
    dataset: String,
    batch_size: Number,
    learning_rate: Number,
    weight_decay: Number,
    momentum: Number,
    optimizer: String,
    criterion: String
})


const project_schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    loading_training_data: {
        type: loading_training_data_schema
    },
    layers: {
        type: [layers_schema]
    },
    training_training_data: {
        type: training_training_data_schema
    },
    max_order: Number
});


//this has an array of the layer schema into each project

const user_schema = new mongoose.Schema({
    username: String,
    projects: [project_schema]
}
)
//this creates an array of project schemas 

mongoose.model('User',user_schema)

