import {
    aws_ssm as ssm,
    Stack,
    StackProps,
} from 'aws-cdk-lib';import { Construct } from "constructs";
import { CodePipeline, CodePipelineSource, ShellStep } from "aws-cdk-lib/pipelines";
import { MyPipelineAppStage } from "./api-stack-stage";

export class ApiPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        

        //connect code star arn with github
        //const connectionArn = ssm.StringParameter.valueForStringParameter(this, '/serverless-api/git/connection-arn', 1);
        const buildCommands = [
            'npm ci',
            'npm run build',
            'cd infra',
            'npm ci',
            'npm run build',
            'npx cdk synth',
            'mv cdk.out ../'
        ];

        //create codepipeline
        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'ServerlessAPI-Pipeline',
            synth: new ShellStep('Build', {
                input: CodePipelineSource.connection('huiyeeleong/aws-cdk-apigateway-dynamodb', 'main', {
                    connectionArn: 'arn:aws:codestar-connections:ap-southeast-2:951639499020:connection/281450c5-d4ba-4650-9145-4f4b9cf7c6dc',
                }),
                commands: buildCommands
            }),
            selfMutation: true,
        });

        pipeline.addStage(new MyPipelineAppStage(this, "Deploy"));
    }
}