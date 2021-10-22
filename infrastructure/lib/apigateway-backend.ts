import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import * as apigwintegreations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as apigateway from '@aws-cdk/aws-apigatewayv2';
import * as crtmgr from '@aws-cdk/aws-certificatemanager';
import * as r53 from '@aws-cdk/aws-route53';

export interface ApiProps extends cdk.StackProps{

    readonly iotUrl: string;
    readonly branchName: string;
    readonly fullDomainName: string;
    readonly certificate: crtmgr.Certificate;
    readonly hostedZone: r53.IHostedZone;
}

export class Api {

    public LAMBDA_ROLE: iam.Role;
    public API_GATEWAY_ROLE: iam.Role;
    public SEND_TO_IOT_FUNCTION: lambda.Function;
    public SEND_TO_IOT_INTEGRATION: apigwintegreations.LambdaWebSocketIntegration;
    public WEBSOCKET_API: apigateway.WebSocketApi;
    public WEBSOCKET_API_DOMAIN: apigateway.DomainName;
    public DNS_RECORD_API: r53.CnameRecord;
    public WEBSOCKET_API_PROD_STAGE: apigateway.WebSocketStage;

    constructor(scope: cdk.Stack, props: ApiProps){

        this.LAMBDA_ROLE = new iam.Role(scope, 'lambda-role', {
            assumedBy: new iam.ServicePrincipal('lambda')
        });
      
        this.SEND_TO_IOT_FUNCTION = new lambda.Function(scope, 'send-to-iot-function', {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('lambda-functions'),
            handler: 'SendToIoT.handler',
            environment: {
              IOT_URL: props.iotUrl
            },
            role: this.LAMBDA_ROLE,
            logRetention: logs.RetentionDays.ONE_WEEK
        });
        this.LAMBDA_ROLE.attachInlinePolicy(new iam.Policy(scope, 'lambda-iot-access', {
            policyName: 'Publish-to-AWS-IoT',
            document: iam.PolicyDocument.fromJson({
              "Version": "2012-10-17",
              "Statement": [
                  {
                      "Sid": "PublishOnAllTopics",
                      "Effect": "Allow",
                      "Action": [
                        "iot:Publish",
                        "iot:Connect"
                      ],
                      "Resource": [
                        `arn:aws:iot:${props.env?.region}:${props?.env?.account}:topic/*`,
                        `arn:aws:iot:*:116827804402:client/*`,
                      ]
                  }
              ]
            })
        }));
        this.LAMBDA_ROLE.addManagedPolicy(iam.ManagedPolicy.fromManagedPolicyArn(scope, 'policy-basic-execution', 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'));
      
        this.API_GATEWAY_ROLE = new iam.Role(scope, 'api-gateway-role', {
            assumedBy: new iam.ServicePrincipal('apigateway')
          });
        this.API_GATEWAY_ROLE.addManagedPolicy(iam.ManagedPolicy.fromManagedPolicyArn(scope, 'policy-apigw-logs', 'arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs'));
      
        this.SEND_TO_IOT_INTEGRATION = new apigwintegreations.LambdaWebSocketIntegration({
            handler: this.SEND_TO_IOT_FUNCTION,
        });
      
        this.WEBSOCKET_API = new apigateway.WebSocketApi(scope, 'websocket-api', {
            apiName: `Teams-On-Air${props.branchName === '' ? '' : `-${props.branchName}`}`,
            description: `Teams On-Air Websocket API that transfers data to AWS IoT`,
        });
        this.WEBSOCKET_API.addRoute('update-light', {
            integration: this.SEND_TO_IOT_INTEGRATION
        });
        this.WEBSOCKET_API.addRoute('ping', {
            integration: this.SEND_TO_IOT_INTEGRATION
        });
      
        this.WEBSOCKET_API_DOMAIN = new apigateway.DomainName(scope, 'websocket-api-domain-name', {
            domainName: `api.${props.fullDomainName}`,
            certificate: props.certificate
        });
      
        this.DNS_RECORD_API = new r53.CnameRecord(scope, 'dns-record-api', {
            recordName: this.WEBSOCKET_API_DOMAIN.name,
            comment: `${this.WEBSOCKET_API_DOMAIN.name} API`,
            zone: props.hostedZone,
            domainName: this.WEBSOCKET_API_DOMAIN.regionalDomainName
        });
      
        this.WEBSOCKET_API_PROD_STAGE = new apigateway.WebSocketStage(scope, 'websocket-api-prod-stage', {
            webSocketApi: this.WEBSOCKET_API,
            stageName: 'prod',
            autoDeploy: true,
            domainMapping: {
              domainName: this.WEBSOCKET_API_DOMAIN
            }
        });
    }
}