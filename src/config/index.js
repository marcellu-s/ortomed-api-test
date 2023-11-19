import { config } from 'dotenv'
import mysql from 'mysql2/promise'

config()

async function databaseConnection() {

    try {

        // Criando a conexão com o banco de dados
        const connection = await mysql.createConnection({
            host: process.env.HOST,
            user: process.env.USER,
            database: process.env.DATABASE,
            password: process.env.PASSWORD
        });

        return connection;

    } catch(err) {

        return false;

    }
}

// Executando a conexão ao banco de dados
export const database = await databaseConnection()
