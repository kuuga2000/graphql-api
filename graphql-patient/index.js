import "colors";
import "dotenv/config";
import express from 'express';
import http from 'http';
import cors from 'cors';
import { expressMiddleware } from '@apollo/server/express4';
import { createServer } from './server.js';
import registerWithEureka from './eureka-helper.js';

const API_PORT = process.env.API_PORT || 4000;
const URL_PATH = process.env.URL_PATH || '/';

const app = express();
const httpServer = http.createServer(app);

const { patient } = await createServer(httpServer);

app.get('/', (req, res) => {
  res.send('404');
});

const applyApolloMiddleware = (app, path, server) => {
  app.use(
    `${URL_PATH}${path}`,
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  );
}

applyApolloMiddleware(app, '', patient);

await new Promise((resolve) => httpServer.listen({ port: API_PORT }, resolve));

console.log(`🚀 Server ready at http://localhost:${API_PORT}/`);
console.log(`🚀 ${"Query at: ".green} ${"https://studio.apollographql.com/dev".blue.bold}`);

registerWithEureka('patient-gql', API_PORT);
