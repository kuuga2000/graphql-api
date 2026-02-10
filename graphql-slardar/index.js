import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql
  type Query {
    latestVersion: String
  }
`;

const resolvers = {
  Query: {
    latestVersion: () => "Apollo Server 5.4.0",
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

// Apollo Server 5 is optimized for Node 22's top-level await
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀 Latest Apollo Server ready at ${url}`);
