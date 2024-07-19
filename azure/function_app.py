import azure.functions as func
import datetime
import json
import logging
import numpy as np 
import pickle 
import pymongo
import copy
from pymongo import MongoClient

# torch
import torch 
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
import torchvision.datasets as datasets
import torchvision.transforms as transforms
from torch.optim.lr_scheduler import StepLR
from torch.utils.data import DataLoader



def update_database(username,project_name,pickled_data):
    with open('secrets','r') as f:
        MONGODB_URI = f.readline()
    connection = MongoClient('mongodb+srv://imamw7428:' + MONGODB_URI + '@cluster0.cggzxjr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/test', 4000)
    database = connection['test']
    collection = database['users']
    #connection


    specific_project = collection.find({"username":username},{'projects': {'$elemMatch' :{'name':project_name}}})
    #finding specific project to update

    document = collection.find({"username":username})
    #finding general user

    data = specific_project[0]['projects'][0]
    # How to convert a pymongo.cursor.Cursor into a dict? 
    # https://stackoverflow.com/questions/28968660/how-to-convert-a-pymongo-cursor-cursor-into-a-dict
    #by: Sede
    #under license CC BY SA 
    #used the fact that it was a list and used [0] instead of the for loop

    data['saved_data'] = pickled_data
    #updating the data 

    all_projects = document[0]['projects']
    # How to convert a pymongo.cursor.Cursor into a dict? 
    # https://stackoverflow.com/questions/28968660/how-to-convert-a-pymongo-cursor-cursor-into-a-dict
    #by: Sede
    #under license CC BY SA 
    #used the fact that it was a list and used indexing instead of the for loop

    for i,val in enumerate(all_projects):
        if (val['name'] == data['name']):
            all_projects[i] = data 
    #updating the list of projects with the updated data     

    query = {"username":username,'projects.name': project_name}
    change = {'$set': {'projects':all_projects}}
    #Updating an object inside an array with PyMongo
    #https://stackoverflow.com/questions/28828825/updating-an-object-inside-an-array-with-pymongo
    #By: Neil Lunn
    #under license CC BY SA 
    #edited it to suit my variables and used differnt function 
    collection.update_one(query,change)







class createmodel(nn.Module):
    def __init__(self,layers):
        super(createmodel, self).__init__()
        self.layers = layers
        self.layerlist = []
        for val in range(len(layers.keys())):
            try:
                self.create_specific_layer(layers[str(val+1)])
                self.layerlist.append(getattr(self,self.layers[str(val+1)]['name']))
            except Exception as e:
                pass
    def create_specific_layer(self,layer):
        if layer['sub_layer'] == 'Convolutional Layer':
            setattr(self, layer['name'],nn.Conv2d(layer['conv_layer']['input_depth'],layer['conv_layer']['output_depth'],layer['conv_layer']['kernal_size'],layer['conv_layer']['stride'],layer['conv_layer']['padding']))
        if layer['sub_layer'] == 'Linear Layer':
            setattr(self,layer['name'],nn.Sequential(nn.Flatten(1),nn.Linear(layer['lin_layer']['input_depth'],layer['lin_layer']['neurons'])))
        if layer['sub_layer'] == 'Pooling Layer':
            setattr(self,layer['name'],nn.AvgPool2d(layer['pool_layer']['pooling_kernal_size'],layer['pool_layer']['pooling_stride'],layer['pool_layer']['pooling_padding']))
        if layer['sub_layer'] == 'Activation Function':
            if layer['activation_function'] == 'ReLU':
                setattr(self,layer['name'],nn.ReLU())
            else:
                raise Exception('not a valid activation function')
            #add some more here later 
        if layer['sub_layer'] == 'Batch Norm':
            setattr(self,layer['name'],nn.BatchNorm2d(layer['batch_norm']))
        if layer['sub_layer'] == 'Dropout':
            setattr(self,layer['name'],nn.Dropout(layer['dropout']))
    def forward(self,x):
        for val in self.layerlist:
            x = val(x)
        # print(x)
        return x
# print(bob)

def train_one_epoch(criterion,optimizer,model,train_data_loader):
    running_loss = 0
    last_loss = 0
    
    for i,data in enumerate(train_data_loader):
        inputs, labels = data
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs,labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item()
    average_loss = running_loss / (i+1)
    return average_loss
    

app = func.FunctionApp()

@app.route(route="http_trigger", auth_level=func.AuthLevel.FUNCTION)
def http_trigger(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    print('hi 2')
    name = False
    #when training stuff through the model, add a linear layer at the end which makes it lead to the approriate number of classes
    try:
        req_body = req.get_json()
    except ValueError:
        return func.HttpResponse(
            "not found",
            status_code=200
        )
    else:
        username = req_body.get('username')
        project_name = req_body.get('project_name')
        layers = req_body.get('layers')
        training = req_body.get('training')
        loading = req_body.get('loading')
        # loading the data 
        transform = transforms.Compose([transforms.ToTensor()])
        #if statments 
        train_data = datasets.MNIST('./',download=False,transform=transform)
        test_data = datasets.MNIST('./',train = False,transform=transform)

        train_data_loader = DataLoader(train_data,batch_size=int(loading['batch_size']),shuffle=int(loading['shuffle']))
        test_data_loader = DataLoader(test_data,batch_size=int(loading['batch_size']))
        #very basic data loading, add augment, random seed and valid size after 
        
        layers = json.loads(layers)
        
        # training the data 

        model = createmodel(layers)
        # need to change these to if statments 
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(model.parameters(),lr=int(training['learning_rate']), weight_decay=int(training['weight_decay']))
        

        for epoch in range(int(training['epoch'])):
            print(f"epoch {epoch+1}")
            train_one_epoch(criterion,optimizer,model,train_data_loader)
            print("completed")
            data = pickle.dumps(model)
            value = pickle.loads(data)
            update_database(str(username),str(project_name),data)
        
        # update_database(username,project_name,value)
        return func.HttpResponse(
            "updated",
            status_code=200
        )
    # if name:
    #     return func.HttpResponse(f"Hello, {name, training, loading}. This HTTPtriggered function executed successfully.")
    # else:
    #     return func.HttpResponse(
    #          "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
    #          status_code=200
    #     )
    
# with open('savemodel','r') as f:
#     print(f.readline())



# transform = transforms.Compose([transforms.ToTensor()])
# train_data = datasets.MNIST('./',download=False,transform=transform)
# test_data = datasets.MNIST('./',train = False,transform=transform)

# # #gASVDA0AAAAAAACMDGZ1bmN0aW9uX2FwcJSMC2NyZWF0ZW1vZGVslJOUKYGUfZQojAh0cmFpbmluZ5SIj
# # #gASVAA0AAAAAAACMCF9fbWFpbl9flIwLY3JlYXRlbW9kZWyUk5QpgZR9lCiMCHRyYWluaW5nlIiMC19w
# # #gASVDA0AAAAAAACMDGZ1bmN0aW9uX2FwcJSMC2NyZWF0ZW1vZGVslJOUKYGUfZQojAh0cmFpbmluZ5SIjAtfcGFyYW1ldGVyc
# # #gASVDA0AAAAAAACMDGZ1bmN0aW9uX2FwcJSMC2NyZWF0ZW1vZGVslJOUKYGUfZQojAh0cmFpbmluZ5S
# #gASVAA0AAAAAAACMCF9fbWFpbl9flIwLY3JlYXRlbW9kZWyUk5QpgZR9lCiMCHRyYWluaW5nlIiMC19wYXJhbWV0ZXJzlIwLY2
# train_data_loader = DataLoader(train_data,batch_size=64,shuffle=True)
# test_data_loader = DataLoader(test_data,batch_size=64)
# # # # # # #very basic data loading, add augment, random seed and valid size after 

# # # # # # # layers = json.loads('{"1":{"name":"conv1","order":1,"next_layers":[],"sub_layer":"Convolutional Layer","conv_layer":{"input_depth":1,"output_depth":32,"kernal_size":3,"stride":1,"padding":1,"_id":"668f2ddc4eef5e48b3bbf497"},"_id":"668f2ddc4eef5e48b3bbf496"},"2":{"name":"act1","order":2,"next_layers":[],"sub_layer":"Activation Function","activation_function":"ReLU","_id":"668f2de84eef5e48b3bbf4ab"},"3":{"name":"Pool1","order":3,"next_layers":[],"sub_layer":"Pooling Layer","pool_layer":{"pooling_kernal_size":2,"pooling_padding":0,"pooling_stride":2,"_id":"668f2e014eef5e48b3bbf4c6"},"_id":"668f2e014eef5e48b3bbf4c5"},"4":{"name":"conv2","order":4,"next_layers":[],"sub_layer":"Convolutional Layer","conv_layer":{"input_depth":32,"output_depth":64,"kernal_size":3,"stride":1,"padding":0,"_id":"668f2e1f4eef5e48b3bbf4e7"},"_id":"668f2e1f4eef5e48b3bbf4e6"},"5":{"name":"act2","order":5,"next_layers":[],"sub_layer":"Activation Function","activation_function":"ReLU","_id":"668f2e3e4eef5e48b3bbf525"},"6":{"name":"Pool2","order":6,"next_layers":[],"sub_layer":"Pooling Layer","pool_layer":{"pooling_kernal_size":2,"pooling_padding":0,"pooling_stride":2,"_id":"668f2ea24eef5e48b3bbf552"},"_id":"668f2ea24eef5e48b3bbf551"},"7":{"name":"Lin1","order":7,"next_layers":[],"sub_layer":"Linear Layer","lin_layer":{"input_depth":2304,"neurons":1000,"_id":"668f2ec04eef5e48b3bbf585"},"_id":"668f2ec04eef5e48b3bbf584"},"8":{"name":"lin2","order":8,"next_layers":[],"sub_layer":"Linear Layer","lin_layer":{"input_depth":1000,"neurons":10,"_id":"668f2ecc4eef5e48b3bbf5be"},"_id":"668f2ecc4eef5e48b3bbf5bd"}}')
# # # # # # # layers = json.loads('{"1":{"name":"conv1","order":1,"next_layers":[],"sub_layer":"Convolutional Layer","conv_layer":{"input_depth":1,"output_depth":32,"kernal_size":3,"stride":1,"padding":1,"_id":"668f2ddc4eef5e48b3bbf497"},"_id":"668f2ddc4eef5e48b3bbf496"}}')
# # # # # # # layers = json.loads('{"1":{"name":"Conv1","order":1,"next_layers":[],"sub_layer":"Convolutional Layer","conv_layer":{"input_depth":1,"output_depth":32,"kernal_size":3,"stride":1,"padding":1,"_id":"66989d9577d4ead83b8f202c"},"_id":"66989d9577d4ead83b8f202b"},"2":{"name":"Act1","order":2,"next_layers":[],"sub_layer":"Activation Function","activation_function":"ReLU","_id":"66989da277d4ead83b8f2046"},"3":{"name":"Pool1","order":3,"next_layers":[],"sub_layer":"Pooling Layer","pool_layer":{"pooling_kernal_size":2,"pooling_padding":2,"pooling_stride":2,"_id":"66989dd377d4ead83b8f2067"},"_id":"66989dd377d4ead83b8f2066"},"4":{"name":"Conv2","order":4,"next_layers":[],"sub_layer":"Convolutional Layer","conv_layer":{"input_depth":32,"output_depth":64,"kernal_size":3,"stride":1,"padding":0,"_id":"66989df077d4ead83b8f208e"},"_id":"66989df077d4ead83b8f208d"},"5":{"name":"Act2","order":5,"next_layers":[],"sub_layer":"Activation Function","activation_function":"ReLU","_id":"66989dfe77d4ead83b8f20ba"},"6":{"name":"Pool2","order":6,"next_layers":[],"sub_layer":"Pooling Layer","pool_layer":{"pooling_kernal_size":2,"pooling_padding":0,"pooling_stride":2,"_id":"66989e0e77d4ead83b8f20ed"},"_id":"66989e0e77d4ead83b8f20ec"},"7":{"name":"Lin1","order":7,"next_layers":[],"sub_layer":"Linear Layer","lin_layer":{"input_depth":2304,"neurons":1000,"_id":"66989e2677d4ead83b8f2126"},"_id":"66989e2677d4ead83b8f2125"},"8":{"name":"Lin2","order":8,"next_layers":[],"sub_layer":"Linear Layer","lin_layer":{"input_depth":1000,"neurons":10,"_id":"66989e3577d4ead83b8f2165"},"_id":"66989e3577d4ead83b8f2164"}}')
# layers = json.loads('{"1":{"name":"Conv1","order":1,"next_layers":[],"sub_layer":"Convolutional Layer","conv_layer":{"input_depth":1,"output_depth":32,"kernal_size":3,"stride":1,"padding":1,"_id":"66989d9577d4ead83b8f202c"},"_id":"66989d9577d4ead83b8f202b"},"2":{"name":"Act1","order":2,"next_layers":[],"sub_layer":"Activation Function","activation_function":"ReLU","_id":"66989da277d4ead83b8f2046"},"3":{"name":"pool1","order":3,"next_layers":[],"sub_layer":"Pooling Layer","pool_layer":{"_id":"6698ab996e1639dc871d89bd","pooling_kernal_size":2,"pooling_stride":2,"pooling_padding":1},"_id":"6698a5f3ab619a05e18cb631"},"4":{"name":"Conv2","order":4,"next_layers":[],"sub_layer":"Convolutional Layer","conv_layer":{"input_depth":32,"output_depth":64,"kernal_size":3,"stride":1,"padding":0,"_id":"66989df077d4ead83b8f208e"},"_id":"66989df077d4ead83b8f208d"},"5":{"name":"Act2","order":5,"next_layers":[],"sub_layer":"Activation Function","activation_function":"ReLU","_id":"66989dfe77d4ead83b8f20ba"},"6":{"name":"Pool2","order":6,"next_layers":[],"sub_layer":"Pooling Layer","pool_layer":{"pooling_kernal_size":2,"pooling_padding":0,"pooling_stride":2,"_id":"66989e0e77d4ead83b8f20ed"},"_id":"66989e0e77d4ead83b8f20ec"},"7":{"name":"Lin1","order":7,"next_layers":[],"sub_layer":"Linear Layer","lin_layer":{"input_depth":2304,"neurons":1000,"_id":"66989e2677d4ead83b8f2126"},"_id":"66989e2677d4ead83b8f2125"},"8":{"name":"Lin2","order":8,"next_layers":[],"sub_layer":"Linear Layer","lin_layer":{"input_depth":1000,"neurons":10,"_id":"66989e3577d4ead83b8f2165"},"_id":"66989e3577d4ead83b8f2164"}}')
# model = createmodel(layers)


# criterion = nn.CrossEntropyLoss()
# optimizer = optim.Adam(model.parameters(),lr = 0.01,weight_decay=0.1)


# for epoch in range(1):
#     print(f"epoch {epoch+1}")
#     train_one_epoch(criterion,optimizer,model,train_data_loader)
#     print("completed")
#     data = pickle.dumps(model)
#     value = pickle.loads(data)
#     update_database("Theo","MNIST",data)


# update_database("Theo","MNIST",value)

# for epoch in range(1):
#     print(f"epoch {epoch+1}")
#     train_one_epoch(criterion,optimizer,model,train_data_loader)
#     print("completed")
#     data = pickle.dumps(model)
#     # value = pickle.loads(data)
#     update_database("Theo","MNIST",data)

# print(model)

# transform = transforms.Compose([transforms.ToTensor()])
# #if statments 
# train_data = datasets.MNIST('./',download=False,transform=transform)
# test_data = datasets.MNIST('./',train = False,transform=transform)

# train_data_loader = DataLoader(train_data,batch_size=64,shuffle=True)
# test_data_loader = DataLoader(test_data,batch_size=64)
# #very basic data loading, add augment, random seed and valid size after 

# layers = json.loads('{"1":{"name":"conv1","order":1,"next_layers":[],"sub_layer":"Convolutional Layer","conv_layer":{"input_depth":1,"output_depth":32,"kernal_size":3,"stride":1,"padding":1,"_id":"668f2ddc4eef5e48b3bbf497"},"_id":"668f2ddc4eef5e48b3bbf496"},"2":{"name":"act1","order":2,"next_layers":[],"sub_layer":"Activation Function","activation_function":"ReLU","_id":"668f2de84eef5e48b3bbf4ab"},"3":{"name":"Pool1","order":3,"next_layers":[],"sub_layer":"Pooling Layer","pool_layer":{"pooling_kernal_size":2,"pooling_padding":0,"pooling_stride":2,"_id":"668f2e014eef5e48b3bbf4c6"},"_id":"668f2e014eef5e48b3bbf4c5"},"4":{"name":"conv2","order":4,"next_layers":[],"sub_layer":"Convolutional Layer","conv_layer":{"input_depth":32,"output_depth":64,"kernal_size":3,"stride":1,"padding":0,"_id":"668f2e1f4eef5e48b3bbf4e7"},"_id":"668f2e1f4eef5e48b3bbf4e6"},"5":{"name":"act2","order":5,"next_layers":[],"sub_layer":"Activation Function","activation_function":"ReLU","_id":"668f2e3e4eef5e48b3bbf525"},"6":{"name":"Pool2","order":6,"next_layers":[],"sub_layer":"Pooling Layer","pool_layer":{"pooling_kernal_size":2,"pooling_padding":0,"pooling_stride":2,"_id":"668f2ea24eef5e48b3bbf552"},"_id":"668f2ea24eef5e48b3bbf551"},"7":{"name":"Lin1","order":7,"next_layers":[],"sub_layer":"Linear Layer","lin_layer":{"input_depth":2304,"neurons":1000,"_id":"668f2ec04eef5e48b3bbf585"},"_id":"668f2ec04eef5e48b3bbf584"},"8":{"name":"lin2","order":8,"next_layers":[],"sub_layer":"Linear Layer","lin_layer":{"input_depth":1000,"neurons":10,"_id":"668f2ecc4eef5e48b3bbf5be"},"_id":"668f2ecc4eef5e48b3bbf5bd"}}')    
# model = createmodel(layers)
# print(model.state_dict)
# # training the data 
# model = createmodel(layers)
# # need to change these to if statments 


# for epoch in range(1):
#     print(f"epoch {epoch+1}")
#     running_loss = 0
#     last_loss = 0
    
#     for i,data in enumerate(train_data_loader):
#         inputs, labels = data
#         optimizer.zero_grad()
#         outputs = model(inputs)
#         loss = criterion(outputs,labels)
#         loss.backward()
#         optimizer.step()
#         running_loss += loss.item()
#     average_loss = running_loss / (i+1)
# torch.save(model.state_dict(),'.\savemodel')
# data = pickle.dumps(model)



# #training the data 
# model = createmodel(layers)
# # print(model.parameters)
# criterion = nn.CrossEntropyLoss()
# optimizer = optim.Adam(model.parameters(),lr = 0.001,weight_decay=0.005)
# scheduler = StepLR(optimizer,step_size = 1)


# for epoch in range(1):
#     print(f"epoch {epoch+1}")
#     train_one_epoch(criterion,optimizer,model,train_data_loader)
#     print("completed")
#     # torch.save(model.state_dict(),'.\savemodel')

# data = pickle.dumps(model)
# # value = pickle.loads(data)
# print(data)

