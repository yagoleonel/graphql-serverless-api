import { ApolloServer } from '@apollo/server';
import { startServerAndCreateLambdaHandler, handlers } from '@as-integrations/aws-lambda';
import schema from './graphql-schema-definition';


const Server = new ApolloServer({
  schema,
});

export const handler = startServerAndCreateLambdaHandler(
  Server,
  handlers.createAPIGatewayProxyEventRequestHandler()
);