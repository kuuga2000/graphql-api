export const typeDefs = `#graphql
    type Query {
        apiStatus: ApiStatus
        getUser: GetUser
    }

    type Mutation {
        createUser(input: UserInput): User
    }

    type ApiStatus {
        status: String
    }

    input UserInput {
        firstName: String
        lastName: String
        email: String
        password: String
    }

    type User {
        firstName: String
        lastName: String
        email: String
    }

    type GetUser {
        status: String
        user_data: User
    }
`