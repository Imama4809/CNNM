import azure.functions as func
import datetime
import json
import logging
import torchvision
import torch 
import json
# test_string = '{"1":{"name":"1","order":1,"next_layers":[],"sub_layer":"Activation Function","activation_function":"1","_id":"668ce6439a9fd6291a58eab9"},"2":{"name":"2","order":2,"next_layers":[],"sub_layer":"Activation Function","activation_function":"2","_id":"668ce64f9a9fd6291a58eac7"}}'
# res = json.loads(test_string)
# print(res[str(1)]['name'])
app = func.FunctionApp()

@app.route(route="http_trigger", auth_level=func.AuthLevel.FUNCTION)
def http_trigger(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    print('hi 2')
    try:
        print('hi')
        req_body = req.get_json()
    except ValueError:
        pass
    else:
        name = req_body.get('name')

    if name:
        return func.HttpResponse(f"Hello, {name}. This HTTP triggered function executed successfully.")
    else:
        return func.HttpResponse(
             "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
             status_code=200
        )