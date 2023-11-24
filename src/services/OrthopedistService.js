import jwt from 'jsonwebtoken';

import { database } from "../config/index.js";

class OrthopedistService {

    // Definir as horas do ortopedista (MAX: 4 horários)
    async setHours(hour, date, token) {

        try {

            const { user_id } = jwt.decode(token, process.env.SECRET);

            const [ rows ] = await database.execute(`SELECT id_usuario AS id_ortopedista FROM usuario WHERE id_usuario = ?`, [user_id]);

            if (!rows.length === 1) {

                return {
                    code: 404,
                    error: "Usuário não indentificado!"
                }
            }

            await database.execute(`INSERT INTO horario (data, hora, id_ortopedista) VALUES (
                ?, ?, ?
            )`, [date, hour, rows[0].id_ortopedista]);

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
}

export const orthopedistService = new OrthopedistService();
