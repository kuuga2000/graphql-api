import "colors";
import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema/index.js";
import { resolvers } from "./resolvers/index.js";

const API_PORT = process.env.API_PORT || 4000;

// const server = new Apolloserver({
//     typeDefs,
//     resolvers,
//     playground: true,
//     introspection: true,
//     context: ({req}) => {
//         const token = req.headers.authorization || '';
//         return {token};
//     }
// });

// server.listen(API_PORT).then(({url}) => {
//     console.log(`🚀  Server ready at ${url}`.green);
// });

const server = new ApolloServer({
    typeDefs, resolvers,
        playground: true,
    introspection: true,
});

const startServer = async () => {
    const { url } = await startStandaloneServer(server, {
        context: async ({ req }) => ({ token: req.headers.token }),
        listen: { port: API_PORT },
    });

    console.log(`🚀 ${"Server is listening at at: ".green} ${url.blue.bold}`);
    console.log(`🚀 ${"Query at: ".green} ${"https://studio.apollographql.com/dev".blue.bold}`)
}

startServer();
