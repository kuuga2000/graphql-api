import "colors";
import "dotenv/config";
import express from 'express';
import http from 'http';
import cors from 'cors';
import { expressMiddleware } from '@apollo/server/express4';
import { createServer } from './server.js';

const API_PORT = process.env.API_PORT;

const app = express();
const httpServer = http.createServer(app);

const { user, product } = await createServer(httpServer);

app.get('/', (req, res) => {
  res.send('404');
});

app.use(
  '/ManageUsers',
  cors(),
  express.json(),
  expressMiddleware(user, {
    context: async ({ req }) => ({ token: req.headers.token }),
  }),
);

app.use(
  '/ManageProducts',
  cors(),
  express.json(),
  expressMiddleware(product, {
    context: async ({ req }) => ({ token: req.headers.token }),
  }),
);

await new Promise((resolve) => httpServer.listen({ port: API_PORT }, resolve));

console.log(`🚀 Server ready at http://localhost:${API_PORT}/`);
console.log(`🚀 ${"Query at: ".green} ${"https://studio.apollographql.com/dev".blue.bold}`);
