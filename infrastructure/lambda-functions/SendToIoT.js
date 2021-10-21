const AWS = require('aws-sdk');

exports.handler =  async function(event, context) {

    if (event.requestContent.routeKey == 'ping'){
        return { statusCode: 200, body: 'Data sent.' };
    }

    if (event.requestContent.routeKey != 'update-light'){
        return { statusCode: 400, body: 'Route Key must be ping or update-light'}
    }

    const data = JSON.parse(event.body);
    const lightId = data.id;
    const red = data.red;
    const green = data.green;
    const blue = data.blue;

    const iotData = { 
        state: {
            desired: {
                red: red,
                green: green,
                blue: blue
            }
        }
    };

    console.log(event);
    console.log(iotData);

    return { statusCode: 200, body: 'Complete' };
};