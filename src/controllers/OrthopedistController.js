import { orthopedistService } from "../services/OrthopedistService.js";

class OrthopedistController {

    async getAllOrthopedist(req, res) {

        const result = await orthopedistService.getAllOrthopedist();

        return res.status(result.code).json(result);
    }

    async getHours(req, res) {

        // orthopedistID
        const { id } = req.params;

        if (!id) {

            return res.status(422).json({
                error: "Faltando parâmetro da requisição!"
            })
        }

        const result = await orthopedistService.getHours(id);

        return res.status(result.code).json(result);
    }

    // Definir as horas do ortopedista
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
