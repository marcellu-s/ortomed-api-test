import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { database } from "../config/index.js"

export default class UserService {

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

        // Salvar usuário no banco
        const isSaved = await this.insertUser(
            'INSERT INTO usuario (nome, sobrenome, email, senha) VALUES (?, ?, ?, ?);', 
            [name, lastName, email, passwordhashSync],
            role
        )

        return isSaved;
    }

    // Registrar usuário - Definir a posição do usuário (paciente, ortopedista, administrador)
    async insertUser(query, values, role=1) {

        try {

            const [ ResultSetHeader ] = await database.execute(query, values);

            let isSuccess;

            // Define o nível de acesso
            if (role === 1) {

                isSuccess = await this.insertPacient(ResultSetHeader.insertId);
            } else if (role === 2) {

                isSuccess = await this.insertOrthopedist(ResultSetHeader.insertId);
            } else if (role === 3) {

                isSuccess = await this.insertAdministrator(ResultSetHeader.insertId)
            } else {

                isSuccess = {
                    error: 'Nível de acesso indefinido',
                    code: 500
                }
            }

            return isSuccess;

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
            const [ rows ] = await database.execute('SELECT id_usuario, nome, sobrenome, senha from usuario WHERE email = ?', [email]);

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

    // Registrar paciente
    async insertPacient(user_id) {

        try {

            await database.execute(`
                INSERT INTO paciente (id_usuario) VALUES (?)
            `, [user_id]);

            return {
                success: 'Paciente registrado com sucesso!',
                code: 201
            };
        } catch(err) {

            console.log(err)

            return {
                error: 'Erro ao registrar o paciente!',
                code: 500
            }
        }
    }

    // Registrar ortopedista
    async insertOrthopedist(user_id) {

        try {
            // '09:00,12:00,15:00,18:00'
            await database.execute(`
                INSERT INTO ortopedista (id_usuario, status) VALUES (
                    ?, ?
                )
            `, [user_id, 'ativo']);

            return {
                success: 'Ortopedista registrado com sucesso!',
                code: 201
            };
        } catch(err) {

            return {
                error: 'Erro ao registrar o ortopedista!',
                code: 500
            }
        }
    }

    // Registrar administrador
    async insertAdministrator(user_id) {

        try {

            await database.execute(`
                INSERT INTO administrador (id_usuario, status) VALUES (
                    ?, ?
                )
            `, [user_id, 'ativo']);

            return {
                success: 'Administrador registrado com sucesso!',
                code: 201
            };
        } catch(err) {

            return {
                error: 'Erro ao registrar o administrador!',
                code: 500
            }
        }
    }
}
