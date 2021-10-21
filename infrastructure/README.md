# Teams On-Air Infrastructure

This is the infrastructure for the **Teams On-Air** site.

See the architecture diagram below:

![](../docs/architecture.png)

## Manual Setup
Spinning up the infrastructure will work, but in order to connect the physical light to AWS IoT you will need to:

 1. Create a Device certificate 
 2. Attach the IoT Policy

For more information on this see the instructions in the [ESP8266-Board README](../ESP8266-Board/README.md)

## CloudFormation Parameters
There are some cloudformation parameters that will need to be set in order to get the stack to deploy and work:

| CfnParameter | Description                                                                                                                                      |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| branch-name  | The name of the branch this stack is deployed from. Used to spin up test environments automatically                                              |
| iot-url      | The URL to access your AWS IoT instance. Needed for lambda to communicate with AWS IoT. Something like xxxxxxxxx-ats.iot.us-east-1.amazonaws.com |
|              |                                                                                                                                                  |

Note that you can either override these when doing `cdk deploy` *or* you can change the code in the [infrastructure-stack.ts](lib/infrastructure-stack.ts) file.

## Continuous Delivery Setup ✅

Changes to the infrastructure get deployed straight to production through [Github Actions](https://github.com/chriiiish/teams-on-air/actions)

Check out the deployment plan in `.github/workflows/deploy-infrastructure`

## Getting started from scratch
    
1. Install Node
2. Install the AWS CLI
3. Install the AWS CDK
   `$ npm install -g aws-cdk`
4. Open a terminal and run
   ```
    cd infrastructure/
    npm install
    npm run build
    npm run test
   ```

At this point you should be able to verify that the code builds and the tests run.


## Useful commands

 * `npm run build`            compile typescript to js
 * `npm run watch`            watch for changes and compile
 * `npm run test`             perform the jest unit tests
 * `cdk deploy`               deploy this stack to your default AWS account/region
 * `cdk diff`                 compare deployed stack with current state
 * `cdk synth`                emits the synthesized CloudFormation template
 * `npm run update`           updates the infrastructure snapshot for testing


## Tests
The infrastructure is unit tested. Please write tests for changes to the infrastructure.

**NOTE: infrastructure will not deploy if tests fail**

To run tests locally: `npm run test`

There is a [snapshot test](https://jestjs.io/docs/snapshot-testing) in place. If you are make changes to the infrastructure you will need to update the snapshot. This tells the test runner you _intended_ to make changes to the infrastructure.

To update the snapshot: `npm run update`


## Test Stacks
To generate a production stack do a regular build and deploy.

To generate a test stack (_branch-name_.on-air.cjl.nz) do two things:
1. Export a `STACK_NAME` variable
   `export STACK_NAME="branch-name"`
2. Specify it as a parameter on the deployment
   `npx cdk deploy --require-approval never --parameters subdomain=$STACK_NAME`

We use test stacks to spin up new instances for pull-requests. E.g. if you create a pull request off the `feature/my-test-branch` branch, then it will create a test environment `my-test-branch.on-air.cjl.nz` 

See `.github/workflows/deploy-test-environment-create.yml`

## WebSocket API
Rather than use a traditional REST API, this project uses a WebSocket API. The reason for doing this is so that the tab stays alive even when in the background of the web browser. For more information see [here](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API#policies_in_place_to_aid_background_page_performance).

This does mean it's a bit harder to document the API, but here we go... 

### Connecting to the api
Connect by opening a websocket to wss://api.on-air.cjl.nz/

```javascript
var ws = new WebSocket('wss://api.on-air.cjl.nz/');
```

### Sending data
All data is wrapped in the following object:

```json
{
   "action": "{ROUTE}",
   "data": {}
}
```

Depending on the ROUTE you will have different values for DATA:

<table>
   <thead>
      <tr>
         <th>ROUTE</th>
         <th>Data payload</th>
         <th>Explanation</th>
      </tr>
   </thead>
   <tbody>
      <tr>
         <td>update-light</td>
         <td><pre>
{
   "id": "OnAir001",
   "red":255,
   "green":255,
   "blue":255
}
</pre></td>
         <td>
            <b>id</b>: the id of the light (should be the same across AWS IoT and NodeMCU board) <br />
            <b>red</b>: the brightness of the RED led (0-255) <br />
            <b>green</b>: the brightness of the GREEN led (0-255) <br />
            <b>blue</b>: the brightness of the BLUE led (0-255) <br />
         </td>
      </tr>
      <tr>
         <td>ping</td>
         <td><pre>"keep-alive"</td>
         <td>
            A keep-alive packet to keep the connection open
         </td>
   </tbody>
</table>

For example:
```javascript
var ws = new WebSocket('wss://api.on-air.cjl.nz');

ws.send({
   "action": "ping",
   "data": "keep-alive"
});

ws.send({
   "action": "update-light",
   "data": {
      "id": "OnAir001",
      "red": 0,
      "green": 255,
      "blue": 0
   }
});
```