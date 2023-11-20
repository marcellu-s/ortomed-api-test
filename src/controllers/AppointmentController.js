import AppointmentService from "../services/AppointmentService.js";

const appointmentService = new AppointmentService();

export default class AppointmentController {

    async setApoointment(req, res) {

        const { service, status, patient_id, orthopedist_id } = req.body;

        if (!service || !status || !patient_id || !orthopedist_id) {

            return res.status(422).json({
                error: 'Dados estão faltando!'
            })
        }

        const result = await appointmentService.setApoointment(service, status, patient_id, orthopedist_id);

        return res.status(result.code).json(result);
    }
}
