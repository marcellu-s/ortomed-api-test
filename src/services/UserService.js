import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { database } from "../config/index.js";

class UserService {

    async getUser(token) {

        try {

            // Descriptografa o token, contendo informações de id (paciente, ortopedista e administrador), 
            // junto com seu cargo
            const tokenDecoded = jwt.decode(token, process.env.SECRET);

            // A partir do cargo do usuario, posso manipular o código para ficar adaptativo
            const role = tokenDecoded.role;

            // exemplo - pegando o id do (paciente, ortopedista ou administrador)
            const id = tokenDecoded[`id_${role}`];

            // manipulando a query com base no cargo do usuário
            const [ user ] = await database.execute(`
                SELECT usuario.id_usuario, usuario.nome, usuario.sobrenome, usuario.email FROM usuario
                JOIN ${role} ON ${role}.id_usuario = usuario.id_usuario
                WHERE ${role}.id_${role} = ?
            `, [id]);

            if (user.length < 1) {

                return {
                    code: 404,
                    error: "Usuário não encontrado!"
                }
            }

            return {
                code: 200,
                success: user[0]
            }

        } catch(err) {

            console.log(err);

            return {
                code: 500,
                error: "Opa, um erro ocorreu ao buscar o usuário!"
            }
        }
    }

    async getToken(email, password, role) {

        // Verifica se o usuário existe
        const exist = await this.userExists(email, password, role);

        if (exist.error) {
            // Usuário não existe, ou passou informações incorretas
            return exist;
        } 

        // Usuário existe e informações válidas, devolve o token de autenticação
        try {

            const secret = process.env.SECRET;

            const token = jwt.sign(exist, secret);

            return {
                code: 200,
                name: exist.name,
                token
            }
        } catch(err) {

            return {
                code: 500,
                error: 'Opa, um erro ocorreu, tente novamente!'
            }
        }
    }

    // Registra usuário - Preparação dos dados
    async setUser(name, lastName, email, password, role) {

        // Verificar se o usuário já existe
        const exist = await this.emailInUse(email);

        if (exist.error) {

            return {
                code: exist.code,
                error: exist.error
            }
        }

        // Criptografia da senha do usuário, antes de salvar no banco de dados
        const salt = await bcryptjs.genSalt(12);
        const passwordhashSync = await bcryptjs.hash(password, salt);

        try {

            const roles = ['paciente', 'ortopedista', 'administrador'];

            if (roles.indexOf(role) < 0) {

                return {
                    code: 422,
                    error: "Cargo inválido!"
                }
            }

            const user_role = roles[roles.indexOf(role)];

            const [ ResultSetHeader ] = await database.execute(`
                INSERT INTO usuario (nome, sobrenome, email, senha) VALUES (
                    ?, ?, ?, ?
                )
            `, [name, lastName, email, passwordhashSync]);

            await database.execute(`
                INSERT INTO ${user_role} (id_usuario) VALUES (
                    ?
                )
            `, [ResultSetHeader.insertId]);

            return {
                code: 201,
                success: 'Cadastro realizado com sucesso!'
            }

        } catch(err) {
                
            return {
                error: 'Opa, um erro ocorreu ao salvar o usuário!',
                code: 500
            };
        }
    }
    // Verifica se o usuário existe, e se a senha é correspondente
    async userExists(email, password, role) {

        try {

            // Retorna a senha do usuário, caso ele exista
            const [ rows ] = await database.execute(`
                SELECT 
                    ${role}.id_${role}, 
                    CONCAT(usuario.nome, " ", usuario.sobrenome) AS nome, 
                    senha
                FROM usuario INNER JOIN ${role}
                ON ${role}.id_usuario = usuario.id_usuario
                WHERE email = ? AND status = '1'
            `, [email]);

            if (rows.length == 1) {
                // Compara a senha enviada na requisição, com a armazenada no banco de dados
                if (await bcryptjs.compare(password, rows[0].senha)) {

                    const payload = {
                        name: rows[0].nome,
                        role: role,
                    }

                    payload[`id_${role}`] = rows[0][`id_${role}`];

                    return payload;
                }

                return {
                    code: 404,
                    error: 'E-mail ou senha incorretos'
                }
            } else {

                return {
                    code: 404,
                    error: 'E-mail ou senha incorretos!'
                };
            }
        } catch(err) {

            return {
                code: 500,
                error: 'Opa, um erro ocorreu, tente novamente!'
            };
        }
    }

    // Verifica se o e-mail já está em uso
    async emailInUse(email) {

        try {

            const query = 'SELECT email from usuario WHERE email = ?;'

            const [ rows ] = await database.execute(query, [email]);

            if (rows.length == 1) {

                return {
                    error: 'O e-mail informado já está em uso!',
                    code: 422
                }
            }

            return {
                success: 'O e-mail informado não está em uso!',
                code: 200
            }

        } catch(err) {

            return {
                error: 'Opa, um erro ocorreu!',
                code: 500
            }
        }
    } 
}

export const userService = new UserService()
