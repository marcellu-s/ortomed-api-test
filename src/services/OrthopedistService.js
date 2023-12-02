import jwt from 'jsonwebtoken';

import { database } from "../config/index.js";

class OrthopedistService {

    // Retorna todos os ortopedistas (ativos) e com horários disponíveis
    async getAllOrthopedist() {

        try {

            let currentDate = new Date();

            let in30Days = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 30); 

            in30Days = `${in30Days.getFullYear()}-${(in30Days.getMonth() + 1).toString().padStart(2, '0')}-${in30Days.getDate().toString().padStart(2, '0')}`;

            currentDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

            const [ rows ] = await database.execute(`
                SELECT ortopedista.id_ortopedista, CONCAT(usuario.nome, " ", usuario.sobrenome) AS nome_ortopedista FROM ortopedista
                JOIN usuario ON usuario.id_usuario = ortopedista.id_usuario
                JOIN horario ON horario.id_ortopedista = ortopedista.id_ortopedista
                WHERE usuario.status = '1' AND horario.status = '0' AND (DATE(horario.data_hora) BETWEEN ? AND ?)
                GROUP BY ortopedista.id_ortopedista
            `, [currentDate, in30Days]);

            return {
                code: 200,
                success: rows
            }
        } catch(err) {

            console.log(err);

            return {
                code: 500,
                error: 'Opa, um erro ocorreu ao buscar os ortopedistas!'
            }
        }
    }

    // Retorna as horas do ortopedista especifico
    async getHours(orthopedistID) {

        try {

            const [ rows ] = await database.execute(`
                SELECT horario.id_horario, horario.id_ortopedista, CONCAT(usuario.nome, " ", usuario.sobrenome) AS nome_ortopedista, horario.status, horario.data_hora FROM horario
                JOIN ortopedista ON ortopedista.id_ortopedista = horario.id_ortopedista
                JOIN usuario ON usuario.id_usuario = ortopedista.id_usuario
                WHERE horario.id_ortopedista = ? AND horario.data_hora > NOW()
                ORDER BY horario.data_hora
            `, [orthopedistID]);

            return {
                code: 200,
                success: rows
            }
        } catch(err) {

            return {
                code: 500,
                error: 'Opa, um erro ocorreu ao buscar os horários'
            }
        }
    }

    // Definir as horas do ortopedista (MAX: 4 horários)
    async setHours(hour, date, token) {

        try {

            const requestedDatetime = new Date(`${date} ${hour}`);

            if (requestedDatetime < new Date()) return { code: 400, error: 'O horário deve ser maior que a data de hoje!' }

            const { id_ortopedista } = jwt.decode(token, process.env.SECRET);

            if (!id_ortopedista) {

                return {
                    code: 401,
                    error: 'Credencial de autenticação inválida, tente fazer Log In novamente!'
                }
            }

            const [ isSameHour ] = await database.execute(`
                SELECT id_horario FROM horario 
                WHERE id_ortopedista = ? AND data_hora = ?
                LIMIT 1
            `, [id_ortopedista, requestedDatetime]);

            if (!(isSameHour.length === 0)) {

                return {
                    code: 403,
                    error: "Data e hora já existentes!"
                }
            }

            await database.execute(`INSERT INTO horario (data_hora, id_ortopedista) VALUES (
                ?, ?
            )`, [`${date} ${hour}`, id_ortopedista]);

            return {
                code: 201,
                success: "Horário registrado com sucesso!"
            }
        } catch(err) {

            return {
                code: 500,
                error: "Opa, um erro ocorreu ao salvar os horários!"
            }
        }
    }

    // Definir consulta como concluída
    async setCompleteAppointment(appointmentID, hourID, token) {

        try {
            const { id_ortopedista } = jwt.decode(token, process.env.SECRET);

            if (!id_ortopedista) {

                return {
                    code: 401,
                    error: 'Credencial de autenticação inválida, tente fazer Log In novamente!'
                }
            }

            // Verificar se a data e hora da consulta já passou
            const [ appointment ] = await database.execute(`
                SELECT data_hora FROM consulta WHERE id_consulta = ? AND id_ortopedista = ? AND status = 'em espera'
            `, [appointmentID, id_ortopedista]);

            if (appointment.length < 1) return { code: 404, error: "Consulta não encontrada!" }

            const currentDatetime = new Date();

            const appointmentDatetime = new Date(appointment[0].data_hora);

            if (currentDatetime < appointmentDatetime) {

                return {
                    code: 403,
                    error: "A conclusão não pode ser efetuada, pois a consulta ainda não aconteceu!"
                }
            } 

            // Executa a conclusão da consulta
            await database.execute(`
                UPDATE consulta SET status = 'concluida' WHERE id_consulta = ?
            `, [appointmentID]);

            await database.execute(`
                UPDATE horario SET status = '0'
                WHERE id_horario = ?
            `, [hourID])

            return {
                code: 200,
                success: "Consulta concluída com sucesso!"
            }
        } catch(err) {

            console.log(err) 

            return {
                code: 500,
                error: "Opa, um erro ocorreu ao concluir a consulta! Tente novamente."
            }
        }
    }
}

export const orthopedistService = new OrthopedistService();
