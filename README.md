# GraphQL - AWS Serverlss

### Project Overview
This project is a GraphQL API demo running on top of an AWS Serverless architecture, deployed using CDK.
##
The API is supposed to manipulate Netflix TV Shows stored in a DynamoDB (database) table.

![AWS Arch Design](./assets/architecture.png)

A GraphQL Apollo Server is bootstraped within an Lambda function using a an Apollo integration lib, designed for this puorpose.

![AWS Arch Design](./assets/server.png)

GraphQL client view:

![GraphQL Dashboard](./assets/graphql-dashboard.png)


##### ___Schema___

###### __GraphQL__

__query__:
* tvshow (id) => Returns one entity
* tvshows => Returns all TV Shows as a collections

__mutations__: 
* udpateDescription(id, description) => Updates a TV Show entity description

###### __Database__
  Data is structured in DynamoDB (database) as follows:
  ``` json
  {
    "show_id": "s1",
    "type": "Movie",
    "title": "Dick Johnson Is Dead",
    "director": "Kirsten Johnson",
    "cast": "",
    "country": "United States",
    "date_added": "September 25, 2021",
    "release_year": 2020,
    "rating": "PG-13",
    "duration": "90 min",
    "listed_in": "Documentaries",
    "description": "As her father nears the end of his life, filmmaker Kirsten Johnson stages his death in inventive and comical ways to help them both face the inevitable."
  }
  ```

### Technologies implemented:
- [GraphQL] - Api Design (https://graphql.org/learn/)
- [Apollo] - GraphQL Framework (https://www.apollographql.com/)

#### AWS Services used:
- [API Gateway] - API service.
- [Lambda] - FAAS (Function as a service).
- [DynamoDB] - Entities storage

## _Commands to deploy_

* `npm run package`                         compile typescript to js
* `cdk deploy --profile <aws_profile>`      deploy this stack to your default AWS account/region
* `cdk diff --profile <aws_profile>`        compare deployed stack with current state
* `cdk synth --profile <aws_profile>`       emits the synthesized CloudFormation template

