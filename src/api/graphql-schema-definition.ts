import { ApolloServer } from '@apollo/server';
import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLNonNull, GraphQLError, GraphQLInt, GraphQLList, GraphQLID } from 'graphql';
import NetflixShowDAO from '../dao/netflix-show.dao';

const netflixShowDAO = new NetflixShowDAO();

const NetflixShowType = new GraphQLObjectType({
    name: 'NetflixShow',
    fields: {
      show_id: { type: GraphQLID },
      type: { type: GraphQLString },
      title: { type: GraphQLString },
      director: { type: GraphQLString },
      cast: { type: GraphQLString },
      country: { type: GraphQLString },
      date_added: { type: GraphQLString },
      release_year: { type: GraphQLInt },
      rating: { type: GraphQLString },
      duration: { type: GraphQLString },
      listed_in: { type: GraphQLString },
      description: { type: GraphQLString },      
    },
})

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: {
            tvshow: {
                type: NetflixShowType,
                args: {
                    show_id: {
                        type: new GraphQLNonNull(GraphQLID)
                    }
                },
                resolve: (_source, args, _context, _info) => {
                    try {
                        return netflixShowDAO.getById(args.show_id);
                    } catch (error) {
                        throw new GraphQLError(JSON.stringify(error));
                    }
                }
            },
            tvshows: {
                type: new GraphQLList(NetflixShowType),
                resolve: (_source, args, _context, _info) => {
                    try {
                        return netflixShowDAO.getAll();
                    } catch (error) {
                        throw new GraphQLError(JSON.stringify(error));
                    }
                }
            }
        }
    }),
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: {
            updateDescription: {
                type: NetflixShowType,
                args: {
                    show_id: {
                        type: new GraphQLNonNull(GraphQLID)
                    },                    
                    description: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: (_source, args, _context, _info) => {
                    try {
                        return netflixShowDAO.updateDescription(args.show_id, args.description);
                    } catch (error) {
                        throw new GraphQLError(JSON.stringify(error));
                    }
                }
            }
        }
    })
})

export default schema;