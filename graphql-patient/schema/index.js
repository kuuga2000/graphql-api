import { gql } from 'graphql-tag';

export const patientTypeDefs = gql`
    type Query {
        getAllPatient: GetAllPatient
        getPatient: GetPatient
    }

    type GetAllPatient {
        status: String
    }

    type Patient {
        patientId: String
        patientName: String
        patientCategory: String
    }

    type GetPatient {
        status: String
        patient_data: Patient
    }
`;
