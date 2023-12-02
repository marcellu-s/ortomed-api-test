import { patientService } from "../services/PatientService.js";

class PatientController {

    async getMyAppointmentById(req, res) {

        const { id } = req.params;

        if (!id) {

            return res.status(422).json({
                error: "ID não encontrado nos parâmetros!"
            });
        }

        const [ , token] = req.headers.authorization.split(' ');

        const result = await patientService.getMyAppointmentById(id, token);

        return res.status(result.code).json(result);
    }

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

        const result = await patientService.getMyAppointments(token, filter, today);
        
        return res.status(result.code).json(result);
    }

    async setApoointment(req, res) {

        const { service, orthopedist_id, hour_id } = req.body;

        if (!service || !orthopedist_id || !hour_id) {

            return res.status(422).json({
                error: 'Dados estão faltando!'
            })
        }

        const [ , token ] = req.headers.authorization.split(' ');

        const result = await patientService.setApoointment(service, orthopedist_id, hour_id, token);

        return res.status(result.code).json(result);
    }

    async setCancelAppointment(req, res) {

        // appointmentID
        const { appointmentID, hourID } = req.query;

        if (!appointmentID || !hourID) {

            return res.status(422).json({
                error: "Parâmetros faltando!"
            })
        }

        const [ , token ] = req.headers.authorization.split(' ');

        const result = await patientService.setCancelAppointment(appointmentID, hourID, token);

        return res.status(result.code).json(result);
    }
}

export const patientController = new PatientController();
