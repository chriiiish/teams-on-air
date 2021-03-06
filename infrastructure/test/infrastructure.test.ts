import { SynthUtils } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import * as cdk from '@aws-cdk/core';
import * as Infrastructure from '../lib/infrastructure-stack';

let app:cdk.App;
let stack:Infrastructure.InfrastructureStack;

beforeAll(() => {
  app = new cdk.App( { 
    outdir: 'cdk.out'
  });
  stack = new Infrastructure.InfrastructureStack(app, 'TestInfrastructureStack');
});

describe('Given that the infrastructure should not change', () => {
  describe('When making changes to the code', () => {
    test('Then the Cloudformation template should not change (if you meant to, run `npm run update-snapshot`)', () => {
      const snapshot = SynthUtils.toCloudFormation(stack);
      expect(snapshot).toMatchSnapshot();
    });
  })
});

describe('Given that we want resources to read nicely', () => {
  describe('When in the AWS Console', () => {
    test('Then the stack should have a description', () => {
      expect(stack.templateOptions.description).toBe('Teams On Air: An on-air light for microsoft teams');
    });
  });
});

describe('Given that the website traffic must be encrypted', () => {
  describe('When users visit the website', () => {
    test('Then a TLS certificate should exist', () => {
      expect(stack).toHaveResource('AWS::CertificateManager::Certificate', {
        DomainName: {
          "Fn::Join": [
            "",
            [
              {
                Ref: 'branchname'
              },
              'on-air.cjl.nz'
            ]
          ]
        },
        ValidationMethod: 'DNS'
      });
    });
  });
});

describe('Given that the user wants to see a webpage', () => {
  describe('When the user accesses the site', () => {
    test('Then the website files must be stored somewhere', () => {
      expect(stack).toHaveResource('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true
        }
      });
    });

    test('Then the website must be hosted in a CDN', () => {
      expect(stack).toHaveResourceLike('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          Aliases: [
            {
              'Fn::Join': [
                '',
                [
                  {
                    Ref: 'branchname'
                  },
                  'on-air.cjl.nz'
                ]
              ]
            }
          ],
          Comment: {
            'Fn::Join': [
              '',
              [
                {
                  Ref: 'branchname'
                },
                'on-air.cjl.nz'
              ]
            ]
          },
          DefaultCacheBehavior: {
            AllowedMethods: [ 'GET', 'HEAD' ],
            CachedMethods: [ 'GET', 'HEAD' ],
            ViewerProtocolPolicy: 'redirect-to-https'
          },
          Enabled: true
        }
      });

      expect(stack).toHaveResourceLike('AWS::CloudFront::CloudFrontOriginAccessIdentity', {
        CloudFrontOriginAccessIdentityConfig: {
          Comment: {
            'Fn::Join': [
              '',
              [
                {
                  Ref: 'branchname'
                },
                'on-air.cjl.nz'
              ]
            ]
          }
        }
      });
    });

    test('Then there should be a DNS record pointing to the CF distribution', () => {
      expect(stack).toHaveResourceLike('AWS::Route53::RecordSet', {
        Comment: {
          'Fn::Join': [
            '',
            [
              {
                Ref: 'branchname'
              },
              'on-air.cjl.nz cloudfront'
            ]
          ]
        },
        Name: {
          'Fn::Join': [
            '',
            [
              {
                Ref: 'branchname'
              },
              'on-air.cjl.nz.'
            ]
          ]
        },
        Type: 'A'
      });
    })
  });
});

describe('Given that we need configuration', () => {
  describe('When deploying the website', () => {
    test('Then there must be an output for the S3 bucket on the CloudFormation Stack', () => {
      expect(stack).toHaveOutput({
        outputName: 'S3Bucket'
      });
    });

    test('Then there must be an output for the CloudFront distribution on the CloudFormation Stack', () => {
      expect(stack).toHaveOutput({
        outputName: 'CloudFrontDistribution'
      });
    });
  });
});

describe('Given we need to pass data to the Physical light', () => {
  describe('Then we need a API gateway', () => {
    test('Then there should be an API gateway', () => {
      expect(stack).toHaveResourceLike('AWS::ApiGatewayV2::Api');
    });
    test('Then the API gateway should be a websocket type', () => {
      expect(stack).toHaveResourceLike('AWS::ApiGatewayV2::Api', {
        ProtocolType: 'WEBSOCKET'
      });
    });
    test('Then the API gateway should have a description', () => {
      expect(stack).toHaveResourceLike('AWS::ApiGatewayV2::Api', {
        Description: 'Teams On-Air Websocket API that transfers data to AWS IoT'
      });
    });
    test('Then the API gateway should have a custom domain', () => {
      expect(stack).toHaveResourceLike('AWS::ApiGatewayV2::DomainName');
    });
    test('Then the API gateway should have an integration', () => {
      expect(stack).toHaveResourceLike('AWS::ApiGatewayV2::Integration');
    });
    test('Then the API gateway should have two routes', () => {
      expect(stack).toHaveResourceLike('AWS::ApiGatewayV2::Route', {
        RouteKey: 'update-light'
      });
      expect(stack).toHaveResourceLike('AWS::ApiGatewayV2::Route', {
        RouteKey: 'ping'
      });
    });
    test('Then we need a lambda function to relay data', () => {
      expect(stack).toHaveResourceLike('AWS::Lambda::Function');
    });
  });
  describe('Then we need an IoT backend', () => {
    test('Then we need an IoT thing', () => {
      expect(stack).toHaveResourceLike('AWS::IoT::Thing');
    });
    test('Then we need an IoT policy', () => {
      expect(stack).toHaveResourceLike('AWS::IoT::Policy');
    });
  });
});

