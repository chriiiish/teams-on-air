import * as cdk from '@aws-cdk/core';
import * as r53 from '@aws-cdk/aws-route53';
import * as alias from '@aws-cdk/aws-route53-targets';
import * as cfr from '@aws-cdk/aws-cloudfront';
import * as certmgr from '@aws-cdk/aws-certificatemanager';
import * as s3 from '@aws-cdk/aws-s3';
import * as iot from '@aws-cdk/aws-iot';
import * as apigatewayiot from '@aws-solutions-constructs/aws-apigateway-iot';
import { CfnParameter, RemovalPolicy } from '@aws-cdk/core';

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
      thingName: 'Julie'
    });

    const IOT_POLICY = new iot.CfnPolicy(this, 'iot-policy', {
      policyDocument: {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": "iot:*",
            "Resource": "arn:aws:iot:region:account:topic/$aws/things/Julie/*"
          }
        ]
      }
    });

    const APIGATEWAY_IOT = new apigatewayiot.ApiGatewayToIot(this, 'ApiGateway', {
      iotEndpoint: 'a2rtq0babjncfg-ats', // This value can be found in IOT Core console > Settings
      apiGatewayCreateApiKey: true,
      apiGatewayProps: {
        domainName: {
          domainName: `api.${DOMAIN_NAME}`,
          certificate: CERTIFICATE
        },
        restApiName: `On-Air`,
        description: 'Teams On-Air light API for communicating to light',
      }
    });

    const DNS_RECORD_API = new r53.CnameRecord(this, 'dns-record-api', {
      recordName: `api.${SUBDOMAIN_NAME}`,
      comment: `api.${DOMAIN_NAME} API`,
      zone: DOMAIN,
      domainName: APIGATEWAY_IOT.apiGateway.domainName?.domainNameAliasDomainName ?? ''
    });
    
  }
}
