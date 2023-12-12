export const resolversUser = {
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

export const resolversProduct = {
    Query: {
        getAllProducts: () => {
            return {
                status: "OK"
            }
        },
        getProduct: () => {
            return {
                status: "OK",
                product_data: {
                    sku: "123",
                    productName: "Product Name x",
                    ProductCategory: "Product Category xx"
                }
            }
        }
    }
}