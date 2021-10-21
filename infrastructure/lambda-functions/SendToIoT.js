const AWS = require('aws-sdk');

exports.handler =  async function(event, context) {

    if (event.requestContext.routeKey == 'ping'){
        return { statusCode: 200, body: 'Data sent.' };
    }

    if (event.requestContext.routeKey != 'update-light'){
        return { statusCode: 400, body: 'Route Key must be ping or update-light'}
    }

    // Configure AWS IoT Endpoint
    const iotData = new AWS.iotData(process.env.IOT_URL);

    const data = JSON.parse(event.body).data;
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

    var params = {
        topic: `$aws/things/${lightId}/shadow/update`,
        payload: JSON.stringify(iotData),
        qos: '1'
      };
    await iotdata.publish(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });

    return { statusCode: 200, body: 'Complete' };
};