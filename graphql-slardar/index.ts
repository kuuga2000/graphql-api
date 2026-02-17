import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';

import { GameService } from './services/game.service.ts';
import { AuthorService } from './services/author.service.ts';
const gameService = new GameService();
const authorService = new AuthorService();

import db from './_db.ts';


// 1. Load the schema from your .graphql file
const typeDefs = loadSchemaSync('./schema.graphql', {
  loaders: [new GraphQLFileLoader()],
});

const resolvers = {
  Query: {
    games: () => gameService.findAll(),
    game: (_: any, args: { id: string }) => gameService.findOne(args.id),
    authors: () => authorService.findAll(),
    author:(_: any, args: { id: string }) => authorService.findOne(args.id),
    reviews: () => db.reviews,
    review(_: any, args: { id: string }) {
      return db.reviews.find((review) => review.id === args.id)
    }
  },
  Game: {
    reviews: (parent: any) => gameService.getReviewsForGame(parent.id)
  },
  Review: {
    author(parent: any) {
      return db.authors.find((a) => a.id === parent.author_id)
    },
    game(parent: any) {
      return db.games.find((g) => g.id === parent.game_id)
    }
  },
  Author: {
    reviews(parent: any) {
      return db.reviews.filter((r) => r.author_id === parent.id)
    }
  },
  Mutation: {
    addGame(_: any, args: any) {
      let game = {
        ...args.game,
        id: Math.floor(Math.random() * 10000).toString()
      }
      db.games.push(game);
      return game;
    },
    deleteGame(_: any, args: { id: string }) {
      db.games = db.games.filter((g) => g.id !== args.id)
      return db.games;
    },
    updateGame(_: any, args: any) {
      db.games = db.games.map((g) => {
        if (g.id === args.id) {
          return { ...g, ...args.edits }
        }

        return g;
      });

      return db.games.find((g) => g.id === args.id)
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

// Apollo Server 5 is optimized for Node 22's top-level await
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀 Latest Apollo Server ready at ${url}`);
