import { administratorService } from '../services/AdministratorService.js';

class AdministratorController {

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

        const [ , token] = req.headers.authorization.split(' ');

        const result = await administratorService.setAdministratorProfileChanges(name, lastName, email, newPassword, administratorID, token);

        return res.status(result.code).json(result);
    }
}

export const administratorController = new AdministratorController();
