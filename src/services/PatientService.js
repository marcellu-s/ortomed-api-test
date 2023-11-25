import jwt from 'jsonwebtoken';

import { database } from "../config/index.js"

class PatientService {

    // Retornar todas as consultas do paciente
    async getMyAppointments(token) {

        try {

            const { id_paciente } = jwt.decode(token, process.env.SECRET);

            if (!id_paciente) {

                return {
                    code: 401,
                    error: 'Credencial de autenticação inválida, tente fazer Log In novamente!'
                }
            }

            const [ rows ] = await database.execute(`
                SELECT * FROM consulta WHERE id_paciente = ?
            `, [id_paciente]);

            if (rows.length < 1) {

                return {
                    code: 200,
                    success: 'Nenhum registro foi encontrado!'
                }
            }

            const payload = [];

            for (let i=0; i < rows.length; i++) {

                payload.push({
                    id_consulta: rows[i].id_consulta,
                    servico: rows[i].servico,
                    data: new Date(rows[i].data).toLocaleString(),
                    hora: rows[i].hora,
                    status: rows[i].status,
                    id_paciente: rows[i].id_paciente,
                    id_ortopedista: rows[i].id_ortopedista
                });
            }

            return {
                code: 200,
                records: payload
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
    async setApoointment(service, orthopedist_id, hour_id, token) {

        try {

            const { id_paciente } = jwt.decode(token, process.env.SECRET);

            if (!id_paciente) {

                return {
                    code: 401,
                    error: 'Credencial de autenticação inválida, tente fazer Log In novamente!'
                }
            }

            // Verifica se o horário está disponível
            const [ rows ] = await database.execute(`
                SELECT id_horario, data, hora FROM horario WHERE id_horario = ? AND id_ortopedista = ? AND status = '0'
            `, [hour_id, orthopedist_id]);

            if (!(rows.length === 1)) {

                return {
                    code: 404,
                    error: "Horário indisponível!"
                }
            }

            // Registra a consulta - em espera
            await database.execute(`
                INSERT INTO consulta (servico, data, hora, id_paciente, id_ortopedista) VALUES (
                    ?, ?, ?, ?, ?
                )
            `, [service, rows[0].data, rows[0].hora, id_paciente, orthopedist_id]);

            // Altera o horário para indisponíveç
            await database.execute(`
                UPDATE horario SET status = '1' WHERE id_horario = ?
            `, [rows[0].id_horario])

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
