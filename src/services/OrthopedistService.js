import jwt from 'jsonwebtoken';

import { database } from "../config/index.js";

class OrthopedistService {

    // Definir as horas do ortopedista (MAX: 4 horários)
    async setHours(hour, date, token) {

        try {

            const { id_ortopedista } = jwt.decode(token, process.env.SECRET);

            if (!id_ortopedista) {

                return {
                    code: 401,
                    error: 'Credencial de autenticação inválida, tente fazer Log In novamente!'
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
}

export const orthopedistService = new OrthopedistService();
