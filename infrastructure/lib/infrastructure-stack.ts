import * as cdk from '@aws-cdk/core';
import * as r53 from '@aws-cdk/aws-route53';
import * as alias from '@aws-cdk/aws-route53-targets';
import * as cfr from '@aws-cdk/aws-cloudfront';
import * as certmgr from '@aws-cdk/aws-certificatemanager';
import * as s3 from '@aws-cdk/aws-s3';
import * as iot from '@aws-cdk/aws-iot';
import * as apigatewayiot from '@aws-solutions-constructs/aws-apigateway-iot';
import * as apigateway from '@aws-cdk/aws-apigatewayv2';
import * as apigwintegreations from '@aws-cdk/aws-apigatewayv2-integrations';
import { CfnParameter, RemovalPolicy } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import * as logs from '@aws-cdk/aws-logs';
import { Policy } from '@aws-cdk/aws-iam';
import { isMainThread } from 'worker_threads';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    const customProps = {
      description: 'Teams On Air: An on-air light for microsoft teams',
      ...props
    }
    super(scope, id, customProps);

    const BRANCH_NAME = new CfnParameter(this, 'branch-name', {
      type: 'String',
      default: '',
      description: 'The branch this stack is for - used to create test instances off pull-requests. Needs trailing dot. Leave default for production'
    });

    const IOT_URL = new CfnParameter(this, 'iot-url', {
      type: 'String',
      default: 'a2rtq0babjncfg-ats.iot.us-east-1.amazonaws.com',
      description: 'The IoT URL for your devices. You can retrieve this from the IoT Console > Settings > Device Data Endpoint'
    });

    const SUBDOMAIN_NAME = `${BRANCH_NAME.valueAsString}on-air`;
    const DOMAIN_NAME = `${SUBDOMAIN_NAME}.cjl.nz`;


    const DOMAIN = r53.HostedZone.fromHostedZoneAttributes(this, 'root-domain', { 
      zoneName: 'cjl.nz',
      hostedZoneId: 'Z0909161DL7J28OF5XCC'
    });

    const CERTIFICATE = new certmgr.Certificate(this, 'domain-certificate', {
      domainName: DOMAIN_NAME,
      validation: certmgr.CertificateValidation.fromDns(DOMAIN),
      subjectAlternativeNames: [
        `api.${DOMAIN_NAME}`
      ]
    });

    const S3_BUCKET = new s3.Bucket(this, 's3-bucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const S3_ORIGIN_ACCESS_ID = new cfr.OriginAccessIdentity(this, 'distribution-oid', {
      comment: DOMAIN_NAME
    });

    const DISTRIBUTION = new cfr.CloudFrontWebDistribution(this, 'distribution', {
      comment: DOMAIN_NAME,
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: S3_BUCKET,
            originAccessIdentity: S3_ORIGIN_ACCESS_ID,
            originPath: '/live'
          },
          behaviors: [
            {
              isDefaultBehavior: true
            }
          ],
        }
      ],
      viewerCertificate: cfr.ViewerCertificate.fromAcmCertificate(CERTIFICATE, { aliases: [ DOMAIN_NAME ]})
    });

    const DNS_RECORD = new r53.ARecord(this, 'dns-record', {
      recordName: SUBDOMAIN_NAME,
      comment: `${DOMAIN_NAME} cloudfront`,
      zone: DOMAIN,
      target: r53.RecordTarget.fromAlias(new alias.CloudFrontTarget(DISTRIBUTION))
    });

    const OUTPUT_S3 = new cdk.CfnOutput(this, 'S3Bucket', {
      description: 'The S3 bucket that holds the files for the website',
      value: S3_BUCKET.bucketName
    });

    const OUTPUT_CLOUDFRONT = new cdk.CfnOutput(this, 'CloudFrontDistribution', {
      description: 'The ID of the cloudfront distribution',
      value: DISTRIBUTION.distributionId
    });

    const IOT_THING = new iot.CfnThing(this, 'iot-thing', {
      thingName: 'OnAir001'
    });

    const IOT_POLICY = new iot.CfnPolicy(this, 'iot-policy', {
      policyDocument: {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": "iot:*",
            "Resource": [
              `arn:aws:iot:${props?.env?.region}:${props?.env?.account}:client/${IOT_THING.thingName}`,
              `arn:aws:iot:${props?.env?.region}:${props?.env?.account}:thing/${IOT_THING.thingName}`,
              `arn:aws:iot:${props?.env?.region}:${props?.env?.account}:topicfilter/${IOT_THING.thingName}/*`,
              `arn:aws:iot:${props?.env?.region}:${props?.env?.account}:topicfilter/$aws/things/${IOT_THING.thingName}/*`,
              `arn:aws:iot:${props?.env?.region}:${props?.env?.account}:topic/$aws/things/${IOT_THING.thingName}/*`
            ]
          }
        ]
      }
    });

    // const APIGATEWAY_IOT = new apigatewayiot.ApiGatewayToIot(this, 'ApiGateway', {
    //   iotEndpoint: 'a2rtq0babjncfg-ats', // This value can be found in IOT Core console > Settings
    //   apiGatewayCreateApiKey: true,
    //   apiGatewayProps: {
    //     domainName: {
    //       domainName: `api.${DOMAIN_NAME}`,
    //       certificate: CERTIFICATE
    //     },
    //     restApiName: `On-Air`,
    //     description: 'Teams On-Air light API for communicating to light',
    //     defaultCorsPreflightOptions: {
    //       allowOrigins: ["*"]
    //     }
    //   }
    // });

    const LAMBDA_ROLE = new iam.Role(this, 'lambda-role', {
      assumedBy: new iam.ServicePrincipal('lambda')
    });

    const SEND_TO_IOT_FUNCTION = new lambda.Function(this, 'send-to-iot-function', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda-functions'),
      handler: 'SendToIoT.handler',
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        IOT_URL: IOT_URL.valueAsString
      },
      role: LAMBDA_ROLE
    });
    LAMBDA_ROLE.attachInlinePolicy(new Policy(this, 'lambda-iot-access', {
      policyName: 'Publish to AWS IoT',
      document: iam.PolicyDocument.fromJson({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublishOnAllTopics",
                "Effect": "Allow",
                "Action": "iot:Publish",
                "Resource": `arn:aws:iot:${this.region}:${props?.env?.account}:topic/*`
            }
        ]
      })
    }));

    const SEND_TO_IOT_INTEGRATION = new apigwintegreations.LambdaWebSocketIntegration({
      handler: SEND_TO_IOT_FUNCTION,
    });

    const WEBSOCKET_API = new apigateway.WebSocketApi(this, 'websocket-api', {
      apiName: `Teams-On-Air-${BRANCH_NAME.valueAsString}`,
      description: `Teams On-Air Websocket API that transfers data to AWS IoT`,
    });
    WEBSOCKET_API.addRoute('update-light', {
      integration: SEND_TO_IOT_INTEGRATION
    });
    WEBSOCKET_API.addRoute('ping', {
      integration: SEND_TO_IOT_INTEGRATION
    });

    const DNS_RECORD_API = new r53.CnameRecord(this, 'dns-record-api', {
      recordName: `api.${SUBDOMAIN_NAME}`,
      comment: `api.${DOMAIN_NAME} API`,
      zone: DOMAIN,
      domainName: WEBSOCKET_API.apiEndpoint
    });

    const WEBSOCKET_API_DOMAIN = new apigateway.DomainName(this, 'websocket-api-domain-name', {
      domainName: DNS_RECORD_API.domainName,
      certificate: CERTIFICATE
    });

    const WEBSOCKET_API_PROD_STAGE = new apigateway.WebSocketStage(this, 'websocket-api-prod-stage', {
      webSocketApi: WEBSOCKET_API,
      stageName: 'prod',
      autoDeploy: true,
      domainMapping: {
        domainName: WEBSOCKET_API_DOMAIN
      }
    });
  }
}
