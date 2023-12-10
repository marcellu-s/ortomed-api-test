import { administratorService } from '../services/AdministratorService.js';

class AdministratorController {

    async getEmployees(req, res) {

        let { filter } = req.query;

        if (!filter) filter = 'all';

        // Verificação caso exista um parâmetro de filtro
        const filtersOptions = ['all', 'ativo', 'inativo'];

        if (filtersOptions.indexOf(filter) < 0) {

            return res.status(400).json({
                error: "Parâmetro de filtro inválido! (aceitos: 'all', 'ativo', 'inativo')"
            });
        }

        const [ , token] = req.headers.authorization.split(' ');

        const result = await administratorService.getEmployees(filter, token);
        
        return res.status(result.code).json(result);
    }

    async getOrthopedistAppointments(req, res) {

        let { filter } = req.query;

        const { id } = req.params;

        if (!filter) filter = 'all';

        // Verificação caso exista um parâmetro de filtro
        const filtersOptions = ['all', 'em espera', 'cancelada', 'concluida'];

        if (filtersOptions.indexOf(filter) < 0) {

            return res.status(400).json({
                error: "Parâmetro de filtro inválido!"
            });
        }

        const [ , token] = req.headers.authorization.split(' ');

        const result = await administratorService.getOrthopedistAppointments(id, filter, token);
        
        return res.status(result.code).json(result);
    }

    async setOrthopedistProfileChanges(req, res) {

        const { name, lastName, email, newPassword, orthopedistID } = req.body;

        const conditions = !name || !lastName || !email || !orthopedistID;
        
        if (((newPassword) && (conditions)) || conditions) { 

            return res.status(422).json({
                error: "Dados estão faltando, verifique e tente novamente!"
            });
        }

        const [ , token] = req.headers.authorization.split(' ');

        const result = await administratorService.setOrthopedistProfileChanges(name, lastName, email, newPassword, orthopedistID, token);

        return res.status(result.code).json(result);
    }

    async setAdministratorProfileChanges(req, res) {

        const { name, lastName, email, newPassword, administratorID } = req.body;

        const conditions = !name || !lastName || !email || !administratorID;
        
        if (((newPassword) && (conditions)) || conditions) { 

            return res.status(422).json({
                error: "Dados estão faltando, verifique e tente novamente!"
            });
        }

        

        const result = await administratorService.setAdministratorProfileChanges(name, lastName, email, newPassword, administratorID, token);

        return res.status(result.code).json(result);
    }

    async setInactivateUser(req, res) {

        const { id } = req.params;

        if (!id) {

            return res.status(422).json({
                error: "Parâmetro ID faltando!"
            });
        }

        const [ , token] = req.headers.authorization.split(' ');

        const result = await administratorService.setInactivateUser(id, token);

        return res.status(result.code).json(result);
    }
}

export const administratorController = new AdministratorController();
