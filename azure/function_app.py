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


    data['saved_data'] = pickled_data
    #updating the data 

    all_projects = document[0]['projects']

    for i,val in enumerate(all_projects):
        if (val['name'] == data['name']):
            all_projects[i] = data 
    #updating the list of projects with the updated data     

    query = {"username":username,'projects.name': project_name}
    change = {'$set': {'projects':all_projects}}
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
            data = pickle.dumps(model.state_dict())
            value = pickle.loads(data)
            update_database(str(username),str(project_name),data)
        
        # update_database(username,project_name,value)
        return func.HttpResponse(
            "updated",
            status_code=200
        )
