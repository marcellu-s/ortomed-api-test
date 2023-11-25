import { userService } from "../services/UserService.js";

class UserController {

    // Criar novo usuário - Cliente
    async setUser(req, res) {

        const { name, lastName, email, password, role } = req.body;

        if (!name || !email || !password || !role) {

            return res.status(422).json({
                error: 'Dados estão faltando!'
            });
        }

        const result = await userService.setUser(name, lastName, email, password, role);

        return res.status(result.code).json(result);
    }

    async login(req, res) {

        const { email, password, role } = req.query;

        if (!email || !password || !role) {

            return res.status(422).json({
                error: 'Dados estão faltando!'
            });
        }

        if (['paciente', 'ortopedista', 'administrador'].indexOf(role) < 0) {

            return res.status(422).json({
                error: 'Cargo inválido!'
            });
        }

        const result = await userService.getToken(email, password, role);

        return res.status(result.code).json(result)
    }
}

export const userController = new UserController();
