import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as cfr from '@aws-cdk/aws-cloudfront';
import * as certmgr from '@aws-cdk/aws-certificatemanager';
import * as r53 from '@aws-cdk/aws-route53';
import * as alias from '@aws-cdk/aws-route53-targets';
import { CfnIntegrationResponse } from '@aws-cdk/aws-apigatewayv2';

export interface WebProps {
    readonly certificate: certmgr.Certificate;
    readonly hostedZone: r53.IHostedZone;
    readonly fullDomainName: string;
    readonly subDomainName: string;
}

export class Web {

    public S3_BUCKET: s3.Bucket;
    public S3_ORIGIN_ACCESS_ID: cfr.OriginAccessIdentity;
    public DISTRIBUTION: cfr.CloudFrontWebDistribution;
    public DNS_RECORD: r53.ARecord;
    public OUTPUT_S3: cdk.CfnOutput;
    public OUTPUT_CLOUDFRONT: cdk.CfnOutput;

    constructor(scope: cdk.Stack, props: WebProps){
        this.S3_BUCKET = new s3.Bucket(scope, 's3-bucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            autoDeleteObjects: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });
        
        this.S3_ORIGIN_ACCESS_ID = new cfr.OriginAccessIdentity(scope, 'distribution-oid', {
            comment: props.fullDomainName
        });
        
        this.DISTRIBUTION = new cfr.CloudFrontWebDistribution(scope, 'distribution', {
            comment: props.fullDomainName,
            originConfigs: [
                {
                s3OriginSource: {
                    s3BucketSource: this.S3_BUCKET,
                    originAccessIdentity: this.S3_ORIGIN_ACCESS_ID,
                    originPath: '/live'
                },
                behaviors: [
                    {
                    isDefaultBehavior: true
                    }
                ],
                }
            ],
            viewerCertificate: cfr.ViewerCertificate.fromAcmCertificate(props.certificate, { aliases: [ props.fullDomainName ]})
        });
        
        this.DNS_RECORD = new r53.ARecord(scope, 'dns-record', {
            recordName: props.subDomainName,
            comment: `${props.fullDomainName} cloudfront`,
            zone: props.hostedZone,
            target: r53.RecordTarget.fromAlias(new alias.CloudFrontTarget(this.DISTRIBUTION))
        });
        
        this.OUTPUT_S3 = new cdk.CfnOutput(scope, 'S3Bucket', {
            description: 'The S3 bucket that holds the files for the website',
            value: this.S3_BUCKET.bucketName
        });
        
        this.OUTPUT_CLOUDFRONT = new cdk.CfnOutput(scope, 'CloudFrontDistribution', {
            description: 'The ID of the cloudfront distribution',
            value: this.DISTRIBUTION.distributionId
        });
    }
}