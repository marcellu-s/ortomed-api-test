import jwt from 'jsonwebtoken';

export default function auth(req, res, next) {

    // Verifica se existe um token na requisição
    const [ , token] = req.headers.authorization ? req.headers.authorization.split(' ') : [ , false];

    if (!token) {

        return res.status(401).json({
            error: 'Credencial de autenticação não encontrada!'
        });
    }

    try {

        jwt.verify(token, process.env.SECRET);

        next();
    } catch(err) {

        return res.status(401).json({
            error: "Credencial de autenticação inválida!"
        });
    }
}
