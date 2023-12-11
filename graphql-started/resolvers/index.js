export const resolvers = {
    Query: {
        apiStatus: () => {
            return {
                status: "OK"
            }
        },
        getUser: () => {
            return {
                status: "OK",
                user_data: {
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@example.com"
                }
            }
        }
    },
    // Mutation: {
    //     createUser: (_, { input }) => {
    //         return input;
    //     }
    // },
    Mutation: {
        createUser: (parent, args, context, info) => {
            return {
                firstName: args.input.firstName,
                lastName: args.input.lastName,
                email: args.input.email,
            }
        }
    },
}
