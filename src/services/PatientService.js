import jwt from 'jsonwebtoken';

import { database } from "../config/index.js"

class PatientService {

    // Retornar todas as consultas do paciente
    async getAppointment(token) {

        try {

            const user_id = jwt.decode(token, process.env.SECRET);

            const teste = await database.execute(`
                SELECT * FROM consulta
                WHERE 
            `);

            console.log(teste);

            return {
                code: 200,
                success: 'OK'
            }
        } catch(err) {

            console.log(err);

            return {
                code: 500,
                error: 'Opa, um erro ocorreu!'
            }
        }
    }

    // Marcar consulta - Em espera
    async setApoointment(service, status, date, hour, orthopedist_id, token) {

        try {

            const { patient_id } = jwt.decode(token, process.env.SECRET).user_id;

            // Registra a consulta
            await database.execute(`
                INSERT INTO consulta (servico, data, hora, status, id_paciente, id_ortopedista) VALUES (
                    ?, ?, ?, ?, ?, ?
                )
            `, [service, date, hour, status, patient_id, orthopedist_id]);

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

export const patientService = new PatientService();
