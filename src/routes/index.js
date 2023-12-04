import { Router } from "express"; 

// Middleswares
import auth from "../middlewares/auth.js";

// Controllers
import { userController } from '../controllers/UserController.js';
import { patientController } from "../controllers/PatientController.js";
import { administratorController } from "../controllers/AdministratorController.js";
import { orthopedistController } from '../controllers/OrthopedistController.js';

export const router = Router();

// ------------------------- LOGIN ------------------------- //

router.get('/login', userController.login);

// ------------------------- USER ------------------------- //

router.get('/user', auth, userController.getUser);
router.post('/user', userController.setUser);

// ------------------------- PACIENT ------------------------- //

router.get('/pacient/appointment', auth, patientController.getMyAppointments);
router.get('/pacient/appointment/:id', auth, patientController.getMyAppointmentById);
router.post('/appointment', auth, patientController.setApoointment);
router.patch('/cancel/appointment', auth, patientController.setCancelAppointment);
router.put('/pacient/edit', auth, patientController.setProfileChanges);

// ------------------------- ORTHOPEDIST ------------------------- //

router.get('/orthopedist', auth, orthopedistController.getOrthopedist);
router.get('/orthopedist/available', orthopedistController.getOrthopedistsAvailable);
router.get('/orthopedist/hours/:id', orthopedistController.getHours);
router.get('/orthopedist/appointment', auth, orthopedistController.getMyAppointments);
router.post('/orthopedist/hours', auth, orthopedistController.setHours);
router.patch('/orthopedist/conclude/appointment', auth, orthopedistController.setCompleteAppointment);

// ------------------------- ADMINISTRATOR ------------------------- //

router.put('/administrator/orthopedist/edit', auth, administratorController.setProfileChanges)
