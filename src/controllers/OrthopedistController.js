import { orthopedistService } from "../services/OrthopedistService.js";

class OrthopedistController {

    // Definir as horas do
    async setHours(req, res) {

        const [ , token] = req.headers.authorization.split(' ');

        const { hour, date } = req.body;

        if (!hour, !date) {

            return res.status(404).json({
                error: 'Dados estão faltando!'
            });
        }

        const result = await orthopedistService.setHours(hour, date, token);

        return res.status(result.code).json(result);
    }
}

export const orthopedistController = new OrthopedistController();
