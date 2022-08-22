import {
  aws_apigateway as apigw,
  aws_lambda as lambda,
  aws_dynamodb as ddb,
  StackProps,
  Stack,
  CfnResource
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {RetentionDays} from "aws-cdk-lib/aws-logs";

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //create dynamodb
    
    const dynamoTable = new ddb.Table(this, 'BookTable', {
      tableName: 'BookStorage',
      readCapacity: 1,
      writeCapacity: 1,
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
      },
    })

    //lambda function created handler
    const createBookFunction = new lambda.Function(this, 'CreateHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('../code'),
      handler: 'create.handler',
      environment: {
        table: dynamoTable.tableName
      },
      logRetention: RetentionDays.ONE_WEEK
    });

    //lambda function get handler
    const getBookFunction = new lambda.Function(this, 'GetHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('../code'),
      handler: 'get.handler',
      environment: {
        table: dynamoTable.tableName
      },
      logRetention: RetentionDays.ONE_WEEK
    });

    //lambda function list handler
    const listBooksFunction = new lambda.Function(this, 'ListHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('../code'),
      handler: 'list.handler',
      environment: {
        table: dynamoTable.tableName
      },
      logRetention: RetentionDays.ONE_WEEK
    });

    //lambda function delete handler
    const deleteBookFunction = new lambda.Function(this, 'DeleteHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('../code'),
      handler: 'delete.handler',
      environment: {
        table: dynamoTable.tableName
      },
      logRetention: RetentionDays.ONE_WEEK
    });

    //lambda function update handler
    const updateBookFunction = new lambda.Function(this, 'UpdateHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('../code'),
      handler: 'update.handler',
      environment: {
        table: dynamoTable.tableName
      },
      logRetention: RetentionDays.ONE_WEEK
    });

    //grant permission lambda function to access dynamo db
    dynamoTable.grant(createBookFunction, 'dynamodb:CreateItem', 'dynamodb:PutItem')
    dynamoTable.grant(getBookFunction, 'dynamodb:GetItem');
    dynamoTable.grant(listBooksFunction, 'dynamodb:Scan')
    dynamoTable.grant(deleteBookFunction, 'dynamodb:DeleteItem')
    dynamoTable.grant(updateBookFunction, 'dynamodb:UpdateItem')

    //create api gateway
    const api = new apigw.RestApi(this, `BookAPI`, {
      restApiName: `book-rest-api`,
    });

    const mainPath = api.root.addResource('books');

    //integrate lambda to api gateway
    const createBookIntegration = new apigw.LambdaIntegration(createBookFunction);
    const getBookIntegration = new apigw.LambdaIntegration(getBookFunction);
    const listBooksIntegration = new apigw.LambdaIntegration(listBooksFunction);
    const deleteBookIntegration = new apigw.LambdaIntegration(deleteBookFunction);
    const updateBookIntegration = new apigw.LambdaIntegration(updateBookFunction);

    //add method to api gatewate
    mainPath.addMethod('GET', listBooksIntegration);
    mainPath.addMethod('POST', createBookIntegration);

    const idPath = mainPath.addResource('{id}');
    idPath.addMethod('GET', getBookIntegration);
    idPath.addMethod('DELETE', deleteBookIntegration);
    idPath.addMethod('PUT', updateBookIntegration);
  }
}
