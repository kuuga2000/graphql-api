export const userTypeDefs = `#graphql
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
`;

export const productTypeDefs = `#graphql
    type Query {
        getAllProducts: GetAllProducts
        getProduct: GetProduct
    }

    type GetAllProducts {
        status: String
    }

    type Product {
        sku: String
        productName: String
        ProductCategory: String
    }

    type GetProduct {
        status: String
        product_data: Product
    }
`;
