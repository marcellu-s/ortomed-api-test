import express from "express";

import { database } from "./config/index.js";
import { router } from './routes/index.js'

const api = express()

api.use(express.json())

database === false ? api.get('/', (req, res) => res.status(500).json({error: 'Erro na conexão com o banco de dados!'})) : api.use(router)

// Local test
api.listen(process.env.PORT, () => {

    console.log('Server on')
})
