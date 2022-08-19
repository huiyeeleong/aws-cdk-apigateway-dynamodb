#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {ApiPipelineStack} from "../lib/api-pipeline-stack";
import {ApiStack} from "../lib/api-stack";

const app = new cdk.App();
new ApiPipelineStack(app, 'PipelineStack', {});
new ApiStack(app, 'ApiStack', {});
app.synth();
