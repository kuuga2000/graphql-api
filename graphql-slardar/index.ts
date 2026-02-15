import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';

import db from './_db.ts';

// 1. Load the schema from your .graphql file
const typeDefs = loadSchemaSync('./schema.graphql', {
  loaders: [new GraphQLFileLoader()],
});

const resolvers = {
  Query: {
    games: () => db.games,
    game(_: any, args: { id: string }) {
      return db.games.find((game) => game.id === args.id)
    },
    authors: () => db.authors,
    author(_: any, args: { id: string }) {
      return db.authors.find((game) => game.id === args.id)
    },
    reviews: () => db.reviews,
    review(_: any, args: { id: string }) {
      return db.reviews.find((review) => review.id === args.id)
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

// Apollo Server 5 is optimized for Node 22's top-level await
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀 Latest Apollo Server ready at ${url}`);
