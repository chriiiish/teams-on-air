import * as cdk from '@aws-cdk/core';
import * as iot from '@aws-cdk/aws-iot';

export interface IoTProps extends cdk.StackProps{
    
}

export class IoT {
    
    public IOT_URL_PARAMETER:cdk.CfnParameter;
    public THING:iot.CfnThing;
    public POLICY:iot.CfnPolicy;

    constructor(scope: cdk.Stack, props: IoTProps){
        this.IOT_URL_PARAMETER = new cdk.CfnParameter(scope, 'iot-url', {
            type: 'String',
            default: 'a2rtq0babjncfg-ats.iot.us-east-1.amazonaws.com',
            description: 'The IoT URL for your devices. You can retrieve this from the IoT Console > Settings > Device Data Endpoint'
        });

        this.THING = new iot.CfnThing(scope, 'iot-thing', {
            thingName: 'OnAir001'
          });
      
        this.POLICY = new iot.CfnPolicy(scope, 'iot-policy', {
            policyDocument: {
                "Version": "2012-10-17",
                "Statement": [
                {
                    "Effect": "Allow",
                    "Action": "iot:*",
                    "Resource": [
                    `arn:aws:iot:${props?.env?.region}:${props?.env?.account}:client/${this.THING.thingName}`,
                    `arn:aws:iot:${props?.env?.region}:${props?.env?.account}:thing/${this.THING.thingName}`,
                    `arn:aws:iot:${props?.env?.region}:${props?.env?.account}:topicfilter/${this.THING.thingName}/*`,
                    `arn:aws:iot:${props?.env?.region}:${props?.env?.account}:topicfilter/$aws/things/${this.THING.thingName}/*`,
                    `arn:aws:iot:${props?.env?.region}:${props?.env?.account}:topic/$aws/things/${this.THING.thingName}/*`
                    ]
                }
                ]
            }
        });
    }
}