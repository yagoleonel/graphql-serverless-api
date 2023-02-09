import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as customresources from 'aws-cdk-lib/custom-resources';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class GraphqlServerlessApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table
    const dynamoDbTable = new dynamodb.Table(this, 'netflix-tvshow-table', {
      partitionKey: { name: 'show_id', type: dynamodb.AttributeType.STRING },
      tableClass: dynamodb.TableClass.STANDARD_INFREQUENT_ACCESS,
      tableName: 'netflix-tvshow-table',
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });


    const lambdaDynamoDbPolicy = new iam.Policy(this, 'netflix-tvshow-lambda-dynamo-table', {
      policyName: 'netflix-tvshow-lambda-dynamo-table',
      statements:[ 
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'dynamodb:GetItem',
            'dynamodb:UpdateItem',
            'dynamodb:PutItem',
            'dynamodb:Scan',
            'dynamodb:BatchWriteItem'
          ],
          resources: [dynamoDbTable.tableArn]
        })
      ]
    })
    // Lambda responsible for running graphQL Apollo server
    const graphQLLambda = new lambda.Function(this, 'netflix-tvshow-graphql-service', {
      code: lambda.Code.fromAsset('.dist/src'),
      functionName: 'netflix-tvshow-graphql-service',
      handler: 'api/graphql-service.handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(1),
      environment: {
        DYNAMODB_CATALOG_TABLE_NAME: dynamoDbTable.tableName
      }
    });
    graphQLLambda.role?.attachInlinePolicy(lambdaDynamoDbPolicy);

    // Lambda to seed dynamoDB table
    const seedDynamoDBLambda = new lambda.Function(this, 'netflix-tvshow-seed-dynamodb-table', {
      code: lambda.Code.fromAsset('.dist/src'),
      functionName: 'netflix-tvshow-seed-dynamodb-table',
      handler: 'setup/seed-dynamodb-table.handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(1),
      environment: {
        DYNAMODB_CATALOG_TABLE_NAME: dynamoDbTable.tableName
      }
    });
    seedDynamoDBLambda.role?.attachInlinePolicy(lambdaDynamoDbPolicy);

    /// Custom resource
    const customResourceProvider = new customresources.Provider(this, 'netflix-tvshow-dynamodb-seed-provider', {
      onEventHandler: seedDynamoDBLambda,
    })
    new cdk.CustomResource(this, 'netflix-tvshow-dynamodb-seed-resource', {
      serviceToken: customResourceProvider.serviceToken,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Api Gateway
    const graphQLServerlessApi = new apigateway.RestApi(this, 'netflix-tvshow-graphql-serverless-api');
    const graphQLServerlessApiResource = graphQLServerlessApi.root.addResource('graphql');
    graphQLServerlessApiResource.addMethod('POST', new apigateway.LambdaIntegration(graphQLLambda));
    graphQLServerlessApiResource.addMethod('GET', new apigateway.LambdaIntegration(graphQLLambda));    
  }
}
