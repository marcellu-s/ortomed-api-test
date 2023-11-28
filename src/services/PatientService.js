import jwt from 'jsonwebtoken';

import { database } from "../config/index.js";

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
                SELECT consulta.*, CONCAT(p.nome, " ", p.sobrenome) AS nome_paciente, CONCAT(o.nome, " ", o.sobrenome) AS nome_ortopedista
                FROM consulta
                JOIN paciente ON paciente.id_paciente = consulta.id_paciente
                JOIN ortopedista ON ortopedista.id_ortopedista = consulta.id_ortopedista
                JOIN usuario AS p ON p.id_usuario = paciente.id_usuario
                JOIN usuario AS o ON o.id_usuario = ortopedista.id_usuario
                WHERE paciente.id_paciente = ?
                ORDER BY consulta.data_hora DESC       
            `, [id_paciente]);

            if (rows.length < 1) {

                return {
                    code: 200,
                    success: 'Nenhum registro foi encontrado!'
                }
            }

            return {
                code: 200,
                success: rows
            }
        } catch(err) {

            return {
                code: 500,
                error: 'Opa, um erro ocorreu!'
            }
        }
    }

    // Retornar consulta pelo id
    async getMyAppointmentById(id, token) {

        try {

            const { id_paciente } = jwt.decode(token, process.env.SECRET);

            if (!id_paciente) {
    
                return {
                    code: 401,
                    error: 'Credencial de autenticação inválida, tente fazer Log In novamente!'
                }
            }

            const [ row ] = await database.execute(`
                SELECT consulta.*, CONCAT(p.nome, " ", p.sobrenome) AS nome_paciente, CONCAT(o.nome, " ", o.sobrenome) AS nome_ortopedista
                FROM consulta
                JOIN paciente ON paciente.id_paciente = consulta.id_paciente
                JOIN ortopedista ON ortopedista.id_ortopedista = consulta.id_ortopedista
                JOIN usuario AS p ON p.id_usuario = paciente.id_usuario
                JOIN usuario AS o ON o.id_usuario = ortopedista.id_usuario
                WHERE consulta.id_consulta = ?
            `, [id]);

            if (row.length === 1) {

                return {
                    code: 200,
                    success: row
                }
            } else {

                return {
                    code: 200,
                    success: `Não foi encontrado nenhum registro de id ${id}`
                }
            }


        } catch(err) {

            console.log(err);

            return {
                code: 500,
                error: "Opa, um erro ocorreu!"
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
                SELECT id_horario, data_hora FROM horario WHERE id_horario = ? AND id_ortopedista = ? AND status = '0'
            `, [hour_id, orthopedist_id]);

            if (!(rows.length === 1)) {

                return {
                    code: 404,
                    error: "Horário indisponível!"
                }
            }

            // Registra a consulta - em espera
            await database.execute(`
                INSERT INTO consulta (servico, data_hora, id_paciente, id_ortopedista) VALUES (
                    ?, ?, ?, ?
                )
            `, [service, rows[0].data_hora, id_paciente, orthopedist_id]);

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
