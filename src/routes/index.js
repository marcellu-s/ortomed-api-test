import { Router } from "express"; 

import UserController from '../controllers/UserController.js';

export const router = Router()

const userController = new UserController();

// ------------------------- LOGIN ------------------------- //

// GET - Login
router.get('/login', userController.login)

// ------------------------- USER ------------------------- //

// POST - User
router.post('/user', userController.setUser)
