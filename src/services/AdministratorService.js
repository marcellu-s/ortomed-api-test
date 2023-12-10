import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

import { database } from "../config/index.js";

class AdministratorService {

    async getEmployees(filter, token) {

        try {

            // Verificar se realmente é um administrador
            const { id_administrador } = jwt.decode(token, process.env.SECRET);

            if (!id_administrador) {

                return {
                    code: 401,
                    error: 'Credencial de autenticação inválida, tente fazer Log In novamente!'
                }
            }

            let queryComplement;

            if (filter != 'all') {

                queryComplement = `WHERE usuario.status = '${filter == 'ativo' ? 1 : 0}'`
            }

            const [ employees ] = await database.query(`
                SELECT usuario.id_usuario, ortopedista.id_ortopedista, usuario.nome, usuario.sobrenome, usuario.email, 'ortopedista' AS cargo FROM ortopedista
                JOIN usuario ON usuario.id_usuario = ortopedista.id_usuario
                ${queryComplement || ''}
                UNION
                SELECT usuario.id_usuario, administrador.id_administrador, usuario.nome, usuario.sobrenome, usuario.email, 'administrador' AS cargo FROM administrador
                JOIN usuario ON usuario.id_usuario = administrador.id_usuario
                ${queryComplement || ''}
                ORDER BY nome ASC
            `);

            if (employees.length < 1) {

                return {
                    code: 200,
                    success: 'Nenhum registro foi encontrado!'
                }
            }

            return {
                code: 200,
                success: employees
            }
        } catch(err) {

            return {
                code: 500,
                error: "Opa, um erro ocorreu ao buscar os ortopedistas!"
            }
        }
    }

    async getOrthopedistAppointments(orthopedistID, filter, token) {

        try {

            const { id_administrador } = jwt.decode(token, process.env.SECRET);

            if (!id_administrador) {

                return {
                    code: 401,
                    error: 'Credencial de autenticação inválida, tente fazer Log In novamente!'
                }
            }

            let queryComplement = '';

            if (filter != 'all') queryComplement = `AND consulta.status = '${filter.toLowerCase()}'`;

            const [ rows ] = await database.execute(`
                SELECT consulta.*, CONCAT(p.nome, " ", p.sobrenome) AS nome_paciente, CONCAT(o.nome, " ", o.sobrenome) AS nome_ortopedista
                FROM consulta
                JOIN paciente ON paciente.id_paciente = consulta.id_paciente
                JOIN ortopedista ON ortopedista.id_ortopedista = consulta.id_ortopedista
                JOIN usuario AS p ON p.id_usuario = paciente.id_usuario
                JOIN usuario AS o ON o.id_usuario = ortopedista.id_usuario
                WHERE ortopedista.id_ortopedista = ? ${queryComplement}
                ORDER BY consulta.data_hora DESC       
            `, [orthopedistID]);

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
                error: "Opa, um erro ocorreu ao buscar as consultas do ortopedista!"
            }
        }
    }

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

    async setAdministratorProfileChanges(name, lastName, email, newPassword, administratorID, token) {

        try {

            const { id_administrador } = jwt.decode(token, process.env.SECRET);

            if (!id_administrador) {

                return {
                    code: 401,
                    error: 'Credencial de autenticação inválida, tente fazer Log In novamente!'
                }
            }

            if (id_administrador == administratorID) {

                return {
                    code: 401,
                    error: 'Editar a si mesmo - É uma ação que só pode ser efetuada por outro administrador!'
                }
            }
            
            // return {
            //     code: 200,
            //     success: 'OK'
            // }

            let params = [name, lastName, email, administratorID];

            if (newPassword) {

                var queryComplement = `, usuario.senha = ?`;

                // Criptografia da senha do usuário, antes de salvar no banco de dados
                const salt = await bcryptjs.genSalt(12);
                const passwordhashSync = await bcryptjs.hash(newPassword, salt);

                params.splice(3, 0, passwordhashSync);
            }

            await database.execute(`
                UPDATE usuario
                JOIN administrador ON administrador.id_usuario = usuario.id_usuario
                SET usuario.nome = ?, usuario.sobrenome = ?, usuario.email = ?${queryComplement || ''}
                WHERE administrador.id_administrador = ?
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

    async setInactivateUser(userID, token) {

        try {

            const { id_administrador } = jwt.decode(token, process.env.SECRET);

            if (!id_administrador) {

                return {
                    code: 401,
                    error: 'Credencial de autenticação inválida, tente fazer Log In novamente!'
                }
            }

            const [[ isAdministrator ]] = await database.execute(`
                SELECT administrador.id_administrador FROM administrador
                JOIN usuario ON usuario.id_usuario = administrador.id_usuario
                WHERE usuario.id_usuario = ?
            `, [userID])

            if (isAdministrator && id_administrador == isAdministrator.id_administrador) {

                return {
                    code: 401,
                    error: 'Inaviar a si mesmo - É uma ação que só pode ser efetuada por outro administrador!'
                }
            }

            await database.execute(`
                UPDATE usuario
                SET status = '0'
                WHERE id_usuario = ?
            `, [userID]);

            return {
                code: 200,
                success: "Usuário inativado com sucesso!"
            }
        } catch(err) {

            return {
                code: 500,
                error: "Opa, um erro ocorreu ao inativar o usuário!"
            }
        }
    }
}

export const administratorService = new AdministratorService();
