import NetflixShowModel from "../model/netflix-show.model";
import * as AWS from 'aws-sdk';

export default class NetflixShowDAO {
    private static dynamoDb: AWS.DynamoDB;
    private static readonly TableName = process.env.DYNAMODB_CATALOG_TABLE_NAME!;

    private static getInstance() {
        if (!NetflixShowDAO.dynamoDb) {
            NetflixShowDAO.dynamoDb = new AWS.DynamoDB();
        }
        return NetflixShowDAO.dynamoDb;
    }

    public async getById (show_id: string): Promise<NetflixShowModel> {
        const dynamo = NetflixShowDAO.getInstance();
        const result = await dynamo.getItem({
            TableName: NetflixShowDAO.TableName,
            Key: AWS.DynamoDB.Converter.marshall({
                show_id
            })
        }).promise()

        if (!result.Item) {
            throw new Error("No item found with given id");
        }

        return this.dynamoDBItemToModel(result.Item);
    }

    public async getAll(): Promise<NetflixShowModel[]> {
        const dynamo = NetflixShowDAO.getInstance();
        const result = await dynamo.scan({
            TableName: NetflixShowDAO.TableName,
        }).promise();

        if (!result.Items?.length) {
            throw new Error("No items found");
        }

        return result.Items.map(item => {
            return this.dynamoDBItemToModel(item);
        })
    }

    public async updateDescription(show_id: string, description: string): Promise<NetflixShowModel> {
        const dynamo = NetflixShowDAO.getInstance();
        const current = await this.getById(show_id);
        current.description = description;
        try {
            await dynamo.putItem({
                TableName: NetflixShowDAO.TableName,
                Item: AWS.DynamoDB.Converter.marshall(current)
            }).promise()
            return current;
        } catch (error) {
            throw new Error ('Unable to update description');
        }
    }

    private dynamoDBItemToModel(item: AWS.DynamoDB.AttributeMap): NetflixShowModel {
            const {
                show_id,
                type,
                title,
                director,
                cast,
                country,
                date_added,
                release_year,
                rating,
                duration,
                listed_in,
                description,
            } = AWS.DynamoDB.Converter.unmarshall(item);

            return {
                show_id,
                type,
                title,
                director,
                cast,
                country,
                date_added,
                release_year,
                rating,
                duration,
                listed_in,
                description,
            } as NetflixShowModel        
    }
}