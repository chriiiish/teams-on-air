#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { Tags } from '@aws-cdk/core';

const app = new cdk.App();
const stackName = process.env.BRANCH_NAME ? `TeamsOnAir-${process.env.BRANCH_NAME}` : '{{PROJ_SAFE_NAME}}-main';

const stack = new InfrastructureStack(app, stackName, {
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  env: {
    account: '116827804402',
    region: 'us-east-1'
  }
});

Tags.of(stack).add('project', 'on-air}}');