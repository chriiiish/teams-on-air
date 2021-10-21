const AWS = require('aws-sdk');

exports.handler =  async function(event, context) {

    if (event.requestContext.routeKey == 'ping'){
        console.log("PING RECEIVED");
        return { statusCode: 200, body: 'Data sent.' };
    }

    if (event.requestContext.routeKey != 'update-light'){
        console.log(`KEY ${event.requestContext.routeKey} NOT FOUND`);
        return { statusCode: 400, body: 'Route Key must be ping or update-light' };
    }

    // Get data from incoming payload
    const data = JSON.parse(event.body).data;
    const lightId = data.id;
    const red = data.red;
    const green = data.green;
    const blue = data.blue;

    const iotPayload = { 
        state: {
            desired: {
                red: red,
                green: green,
                blue: blue
            }
        }
    };

    // Send data to AWS IoT
    const iotData = new AWS.IotData({ endpoint: process.env.IOT_URL });
    var params = {
        topic: `$aws/things/${lightId}/shadow/update`,
        payload: JSON.stringify(iotPayload),
        qos: '0'
    };
    const request = iotData.publish(params);
    await request.send();

    return { statusCode: 200, body: 'Data relayed.' };
};