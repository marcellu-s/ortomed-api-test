import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { database } from "../config/index.js"

class UserService {

    async getToken(email, password) {

        // Verifica se o usuário existe
        const exist = await this.userExists(email, password);

        if (exist.error) {
            // Usuário não existe, ou passou informações incorretas
            return exist;
        } 

        // Usuário existe e informações válidas, devolve o token de autenticação
        try {

            const secret = process.env.SECRET;

            const token = jwt.sign({
                user_id: exist.id_usuario,
                name: exist.nome,
                lastName: exist.sobrenome
            }, secret);

            return {
                code: 200,
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
            
            await database.execute(`
                INSERT INTO usuario (nome, sobrenome, email, senha, status, funcao) VALUES (
                    ?, ?, ?, ?, ?, ?
                )
            `, [name, lastName, email, passwordhashSync, 'ativo', roles[role]]);

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
    async userExists(email, password) {

        try {
            // Retorna a senha do usuário, caso ele exista
            const [ rows ] = await database.execute('SELECT id_usuario, nome, sobrenome, senha from usuario WHERE email = ? AND status = "ativo"', [email]);

            if (rows.length == 1) {
                // Compara a senha enviada na requisição, com a armazenada no banco de dados
                if (await bcryptjs.compare(password, rows[0].senha)) {

                    return rows[0];
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
