import * as cdk from '@aws-cdk/core';
import * as r53 from '@aws-cdk/aws-route53';
import * as certmgr from '@aws-cdk/aws-certificatemanager';
import * as iot from './iot-backend';
import * as webHosting from './website-hosting';
import * as api from './apigateway-backend';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    const customProps = {
      description: 'Teams On Air: An on-air light for microsoft teams',
      ...props
    }
    super(scope, id, customProps);

    const BRANCH_NAME = new cdk.CfnParameter(this, 'branch-name', {
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

    // Hosts the Web Application
    const WEB_HOSTING = new webHosting.Web(this, {
      certificate: CERTIFICATE,
      hostedZone: DOMAIN,
      fullDomainName: DOMAIN_NAME,
      subDomainName: SUBDOMAIN_NAME
    });

    // Back-End Connection to Physical Light
    const IOT_BACKEND = new iot.IoT(this, {...props});

    // Hosts the API
    const API_BACKEND = new api.Api(this, {
      iotUrl: IOT_BACKEND.IOT_URL_PARAMETER.valueAsString,
      branchName: BRANCH_NAME.valueAsString,
      fullDomainName: DOMAIN_NAME,
      certificate: CERTIFICATE,
      hostedZone: DOMAIN,
      ...props
    });
  }
}
