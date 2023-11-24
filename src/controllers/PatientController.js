import { patientService } from "../services/PatientService.js";

class PatientController {

    async getAppointment(req, res) {

        const { filter } = req.query;

        if (!filter) {

            return res.status(422).json({
                error: 'Parâmetro está faltando'
            });
        }

        const [ , token] = req.headers.authorization.split(' ');

        const result = await patientService.getAppointment(token, filter);

        return res.status(result.code).json(result);
    }

    async setApoointment(req, res) {

        const { service, status, date, hour, orthopedist_id } = req.body;

        if (!service || !status || !orthopedist_id || !date || !hour) {

            return res.status(422).json({
                error: 'Dados estão faltando!'
            })
        }

        const [ , token ] = req.headers.authorization.split(' ');

        const result = await patientService.setApoointment(service, status, date, hour, orthopedist_id, token);

        return res.status(result.code).json(result);
    }
}

export const patientController = new PatientController();
