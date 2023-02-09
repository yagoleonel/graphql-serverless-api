import { CloudFormationCustomResourceEvent, CloudFormationCustomResourceFailedResponse, CloudFormationCustomResourceResponse, CloudFormationCustomResourceSuccessResponse } from 'aws-lambda';
import * as AWS from 'aws-sdk'
// import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import catalogCollection from "./netflix_catalog.json"

const dynamoDB = new AWS.DynamoDB();

export const handler = async (event: CloudFormationCustomResourceEvent): Promise<CloudFormationCustomResourceResponse> => {
    try {
        // Applies only when creating a new stack
        if (event.RequestType === 'Create') {
            const MAX_BATCH_ITEMS_QTY = 20;
            const itemChunks = [];
            while (catalogCollection.length) {
                const spliced = catalogCollection.splice(0, MAX_BATCH_ITEMS_QTY);
                itemChunks.push(spliced.map(tvshow => {
                    return {
                        PutRequest: {
                            Item: AWS.DynamoDB.Converter.marshall(tvshow)
                        }
                    }
                }));
            }
    
            for (const itemChunk of itemChunks) {
                const params = {
                    RequestItems: {}
                } as AWS.DynamoDB.Types.BatchWriteItemInput ;
                params.RequestItems[process.env.DYNAMODB_CATALOG_TABLE_NAME!] = itemChunk;
                await dynamoDB.batchWriteItem(params).promise();
            }
        }
    } catch (error) {
        console.error(error);
        return {
            Status: 'FAILED'
        } as CloudFormationCustomResourceFailedResponse;
    }
    return {
        Status: 'SUCCESS'
    } as CloudFormationCustomResourceSuccessResponse;    
};