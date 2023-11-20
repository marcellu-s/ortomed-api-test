import { Router } from "express"; 

import UserController from '../controllers/UserController.js';
import auth from "../middlewares/auth.js";
import AppointmentController from "../controllers/AppointmentController.js";

export const router = Router()

const userController = new UserController();
const appointmentController = new AppointmentController();

// ------------------------- LOGIN ------------------------- //

// GET - Login
router.get('/login', userController.login)

// ------------------------- USER ------------------------- //

// POST - User
router.post('/user', userController.setUser)

// ------------------------- MAKE AN APPOINTMENT ------------------------- //

// POST- APPOINTMENT
router.post('/appointment', auth, appointmentController.setApoointment)
