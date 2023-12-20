export const resolversPatient = {
    Query: {
        getAllPatient: () => {
            return {
                status: "OK"
            }
        },
        getPatient: () => {
            return {
                status: "OK",
                patient_data: {
                    patientId: "123",
                    patientName: "Robocop Murphy",
                    patientCategory: "BPJS"
                }
            }
        }
    }
}