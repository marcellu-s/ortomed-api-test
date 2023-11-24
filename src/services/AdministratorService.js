import { database } from "../config/index.js"

class AdministratorService {

    async sql(query) {

        try {

            await database.query(query);

            return {
                code: 200,
                success: "OK"
            }
        } catch(err) {

            return {
                code: 500,
                error: "NOT OK"
            }
        }
    }
}

export const administratorService = new AdministratorService();
