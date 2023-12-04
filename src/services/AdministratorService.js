import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

import { database } from "../config/index.js";

class AdministratorService {

    async setOrthopedistProfileChanges(name, lastName, email, newPassword, orthopedistID, token) {

        try {

            const { id_administrador } = jwt.decode(token, process.env.SECRET);

            if (!id_administrador) {

                return {
                    code: 401,
                    error: 'Credencial de autenticação inválida, tente fazer Log In novamente!'
                }
            }

            let params = [name, lastName, email, orthopedistID];

            if (newPassword) {

                var queryComplement = `, usuario.senha = ?`;

                // Criptografia da senha do usuário, antes de salvar no banco de dados
                const salt = await bcryptjs.genSalt(12);
                const passwordhashSync = await bcryptjs.hash(newPassword, salt);

                params.splice(3, 0, passwordhashSync);
            }

            await database.execute(`
                UPDATE usuario
                JOIN ortopedista ON ortopedista.id_usuario = usuario.id_usuario
                SET usuario.nome = ?, usuario.sobrenome = ?, usuario.email = ?${queryComplement || ''}
                WHERE ortopedista.id_ortopedista = ?
            `, params);

            return {
                code: 200,
                success: "Usuário editado com sucesso!"
            }
        } catch(err) {

            return {
                code: 500,
                error: "Opa, um erro ocorreu ao tentar editar o usuário!"
            }
        }
    }
}

export const administratorService = new AdministratorService();
