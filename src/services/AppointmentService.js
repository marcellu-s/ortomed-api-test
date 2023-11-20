import { database } from "../config/index.js"

export default class AppointmentService {

    // Marcar consulta - Em espera
    async setApoointment(service, status, patient_id, orthopedist_id) {

        try {

            // Registra a consulta
            const [ apoointmentResult ] = await database.execute(`
                INSERT INTO consulta (servico, data, hora, status, id_paciente, id_ortopedista) VALUES (
                    ?, NOW(), NOW(), ?, ?, ?
                )
            `, [service, status, patient_id, orthopedist_id]);

            // Registra a consulta no histórico de consultas do paciente
            await database.execute(`
                INSERT INTO historico_consulta (id_consulta, id_paciente) VALUES (
                    ?, ?
                )
            `, [apoointmentResult.insertId, patient_id]);

            return {
                code: 200,
                success: 'Consulta marcada com sucesso!'
            }
        } catch(err) {

            return {
                code: 500,
                error: 'Opa, um erro ocorreu! Tente novamente!'
            }
        }
    }
}
