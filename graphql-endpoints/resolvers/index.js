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
                    firstName: "Johnxxx",
                    lastName: "Doe",
                    email: "john@example.com"
                }
            }
        }
    },
    Mutation: {
        createUser: (_, { input }) => {
            return input;
        }
    }
}