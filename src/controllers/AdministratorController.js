import { administratorService } from '../services/AdministratorService.js';

class AdministratorController {

    async sql(req, res) {

        const { query } = req.body;

        if (!query) {

            return res.status(404).json({
                error: 'Dados estão falntando!'
            });
        }

        const result = await administratorService.sql(query);

        return res.status(result.code).json(result);
    }
}

export const administratorController = new AdministratorController();
