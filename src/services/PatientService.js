import jwt from 'jsonwebtoken';

import { database } from "../config/index.js";

class PatientService {

    // Retornar todas as consultas do paciente
    async getMyAppointments(token, filter, today) {

        try {

            const { id_paciente } = jwt.decode(token, process.env.SECRET);

            if (!id_paciente) {

                return {
                    code: 401,
                    error: 'Credencial de autenticação inválida, tente fazer Log In novamente!'
                }
            }

            let queryComplement = '';

            if (filter != 'all') queryComplement = `AND consulta.status = '${filter.toLowerCase()}'`;

            if (today === true) queryComplement = `${queryComplement} AND DATE(consulta.data_hora) = CURDATE()`;

            console.log(queryComplement);

            const [ rows ] = await database.execute(`
                SELECT consulta.*, CONCAT(p.nome, " ", p.sobrenome) AS nome_paciente, CONCAT(o.nome, " ", o.sobrenome) AS nome_ortopedista
                FROM consulta
                JOIN paciente ON paciente.id_paciente = consulta.id_paciente
                JOIN ortopedista ON ortopedista.id_ortopedista = consulta.id_ortopedista
                JOIN usuario AS p ON p.id_usuario = paciente.id_usuario
                JOIN usuario AS o ON o.id_usuario = ortopedista.id_usuario
                WHERE paciente.id_paciente = ? ${queryComplement}
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

    // Pegar a diferença de horário entre a data atual e a da consulta
    getDifferenceInHours(datetime) {

        // Seta a data da consulta
        const appointmentDatetime = new Date(datetime);
        // Seta a data atual
        const currentDate = new Date();
        // Calcule a diferença em milissegundos
        const differenceInMilliseconds = Math.abs(appointmentDatetime - currentDate);
        // Converta a diferença em horas e retorna
        return (differenceInMilliseconds / (1000 * 60 * 60)).toFixed(1);
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

            // Verifica se o horário está disponível ou se já passou
            if (!(rows.length === 1) || new Date() > new Date(rows[0].data_hora)) {

                return {
                    code: 404,
                    error: "Horário indisponível!"
                }
            }

            // Verifica se a consulta será marcada 24 horas antes
            const differenceInHours = this.getDifferenceInHours(rows[0].data_hora);

            if (differenceInHours < 24) {

                return {
                    code: 400,
                    error: "A consulta deve ser marcada 24 horas antes!"
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
                code: 201,
                success: 'Consulta marcada com sucesso!'
            }
        } catch(err) {

            console.log(err);

            return {
                code: 500,
                error: 'Opa, um erro ocorreu! Tente novamente!'
            }
        }
    }

    async setCancelAppointment(appointmentID, hourID, token) {

        try {

            const { id_paciente } = jwt.decode(token, process.env.SECRET);

            if (!id_paciente) {

                return {
                    code: 401,
                    error: 'Credencial de autenticação inválida, tente fazer Log In novamente!'
                }
            }

            const [ row ] = await database.execute(`
                SELECT * FROM consulta
                WHERE id_paciente = ? AND id_consulta = ? AND status = "em espera"
            `, [id_paciente, appointmentID]);

            if (row.length < 1) {

                return {
                    code: 404,
                    error: 'Consulta não encontrada ou já cancelada!'
                }
            }

            const differenceInHours = this.getDifferenceInHours(row[0].data_hora)

            if (differenceInHours > 24) {
                // Pode cancelar a consulta
                await database.execute(`
                    UPDATE consulta SET status = "cancelada" WHERE id_consulta = ?;
                `, [appointmentID]);
                
                await database.execute(`
                    UPDATE horario SET status = "0" WHERE id_horario = ?;
                `, [hourID]);

                return {
                    code: 200,
                    success: "Consulta cancelada com sucesso!"
                }
            } else {
                // Não pode cancelar a consulta
                return {
                    code: 400,
                    error: `A consulta deve ter 24 horas de diferença entre a data atual e a da consulta!`
                }
            }
        } catch(err) {

            console.log(err);

            return {
                code: 500,
                error: "Opa, um erro ocorreu ao tentar realizar esta ação!"
            }
        }
    }
}

export const patientService = new PatientService();
