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

        const { email, password } = req.query;

        if (!email || !password) {

            return res.status(422).json({
                error: 'Dados estão faltando!'
            });
        }

        const result = await userService.getToken(email, password);

        return res.status(result.code).json(result)
    }
}

export const userController = new UserController();
