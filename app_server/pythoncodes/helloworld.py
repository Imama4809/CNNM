import torch 
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
import torchvision.datasets as datasets
import torchvision.transforms as transforms
from torch.optim.lr_scheduler import StepLR
from torch.utils.data import DataLoader

#loading the data
  
print('hello world')
  
train_data = datasets.MNIST(root = 'data', train = True, download = True, transform = transforms.ToTensor())
train_loader = DataLoader(train_data,batch_size = 64,shuffle = True)
test_data = datasets.MNIST(root = 'data', train = False, download = True, transform = transforms.ToTensor())
test_loader = DataLoader(test_data,batch_size = 64, shuffle = True)


class CNN(nn.Module):
    def __init__(self):
        super(CNN,self).__init__()
        self.layer1 = nn.Sequential(
            nn.Conv2d(1,32,kernel_size = 3,stride = 1,padding =1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2,stride=2))
        self.layer2 = nn.Sequential(
            nn.Conv2d(32,64,kernel_size=3),
            nn.ReLU(),
            nn.MaxPool2d(2))
        self.fc1 = nn.Linear(64*6*6,1000)
        self.fc2 = nn.Linear(1000,10)
    def forward(self,x):
        x = self.layer1(x)
        x = self.layer2(x)
        x = x.view(x.size(0),-1)
        x = self.fc1(x)
        x = self.fc2(x)
        return x 


    


def train_model(model,train_loader,optimizer,scheduler, epochs):
    model.train()
    for epoch in range(1):
        print(f"epoch {epoch+1} in progress...",end = '')
        for images,labels in train_loader:
            outputs = model(images)
            loss = criterion(outputs,labels)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
        print('completed') 
        scheduler.step()
        

def test_model(model,test_loader):
    #eval mode 
    model.eval()
    test_loss = []
    correct = 0
    with torch.no_grad():
        for data,target in test_loader:
            output = model(data)
            test_loss.append(F.nll_loss(output,target,reduction = 'sum').item())
            pred = output.argmax(dim=1,keepdim=True)
            correct += pred.eq(target.view_as(pred)).sum().item()
    #output test_loss and correct guesses later 
    return [test_loss,correct]


model = CNN()
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(),lr = 0.001,weight_decay=0.005)
scheduler = StepLR(optimizer,step_size = 1)

print(len(test_loader.dataset))

train_model(model,train_loader,optimizer,scheduler,10)
print(test_model(model,test_loader))