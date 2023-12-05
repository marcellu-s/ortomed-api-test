import { orthopedistService } from "../services/OrthopedistService.js";

class OrthopedistController {

    // Consultas marcadas do ortopedista
    async getMyAppointments(req, res) {

        let { filter, today } = req.query;

        if (!filter) filter = 'all';

        today = today == 'true' ? true : false;

        // Verificação caso exista um parâmetro de filtro
        const filtersOptions = ['all', 'em espera', 'cancelada', 'concluida'];

        if (filtersOptions.indexOf(filter) < 0) {

            return res.status(400).json({
                error: "Parâmetro de filtro inválido!"
            });
        }

        const [ , token] = req.headers.authorization.split(' ');

        const result = await orthopedistService.getMyAppointments(token, filter, today);
        
        return res.status(result.code).json(result);
    }

    async getOrthopedistsAvailable(req, res) {

        const result = await orthopedistService.getOrthopedistsAvailable();

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

        
        const { hour, date } = req.body;
        
        if (!hour, !date) {
            
            return res.status(404).json({
                error: 'Dados estão faltando!'
            });
        }
        
        const [ , token] = req.headers.authorization.split(' ');
        
        const result = await orthopedistService.setHours(hour, date, token);

        return res.status(result.code).json(result);
    }

    // Definir consulta como concluída
    async setCompleteAppointment(req, res) {

        const { appointmentID, hourID } = req.query;

        if (!appointmentID || !hourID) return res.status(422).json({ error: 'ID da consulta e do horário são obrigatórios!' });

        const [ , token] = req.headers.authorization.split(' ');

        const result = await orthopedistService.setCompleteAppointment(appointmentID, hourID, token);

        return res.status(result.code).json(result);
    }
}

export const orthopedistController = new OrthopedistController();
