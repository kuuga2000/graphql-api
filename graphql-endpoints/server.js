import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { userTypeDefs, productTypeDefs } from "./schema/index.js";
import { resolversUser, resolversProduct } from "./resolvers/index.js";

export async function createServer(httpServer) {
    const envProd = () => {
        return process.env.NODE_ENV === 'production'
    }

    const user = new ApolloServer({
        typeDefs: userTypeDefs,
        resolvers: resolversUser,
        introspection: !envProd(),
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            envProd() ? ApolloServerPluginLandingPageDisabled() : ApolloServerPluginLandingPageLocalDefault(),
        ],
    });

    await user.start();

    const product = new ApolloServer({
        typeDefs: productTypeDefs,
        resolvers: resolversProduct,
        introspection: !envProd(),
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            envProd() ? ApolloServerPluginLandingPageDisabled() : ApolloServerPluginLandingPageLocalDefault(),
        ],
    });

    await product.start();

    return { user, product };
}
