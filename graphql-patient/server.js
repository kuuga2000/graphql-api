import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { patientTypeDefs } from "./schema/index.js";
import { resolversPatient } from "./resolvers/index.js";

export async function createServer(httpServer) {
    const envProd = () => {
        return process.env.NODE_ENV === 'production'
    }

    const patient = new ApolloServer({
        typeDefs: patientTypeDefs,
        resolvers: resolversPatient,
        introspection: !envProd(),
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            envProd() ? ApolloServerPluginLandingPageDisabled() : ApolloServerPluginLandingPageLocalDefault(),
        ],
    });

    await patient.start();

    return { patient };
}
