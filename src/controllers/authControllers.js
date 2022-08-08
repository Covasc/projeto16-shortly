import joi from "joi";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import connection from "../db.js";

export async function signUp(request, response) {

    const userData = request.body;

    const credentialsSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        confirmPassword: joi.ref('password')
    });
    const validation = credentialsSchema.validate(userData);
    if (validation.error) {
        console.log(validation.error.details);
        return response.sendStatus(422);
    };

    try {
        const { rows: userRegistred } = await connection.query(
            `SELECT * FROM users
            WHERE email = $1`, 
            [userData.email]
        );

        if (userRegistred[0]) {
            return response.sendStatus(409);
        }

        await connection.query(
            `INSERT INTO users(name, email, password)
            VALUES ($1, $2, $3)`,
            [userData.name, userData.email, bcrypt.hashSync(userData.password, 10)]
        );
        
        response.sendStatus(201);
        
    } catch(error) {
        console.log(error);
        response.sendStatus(500);
    }
}

export async function signIn (request, response) {

    const userCredentials = request.body;
    var token;

    function addNewToken() {
        const newToken = uuid();
        token = newToken;
        return newToken;
    }

    const credentialsSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });
    const validation = credentialsSchema.validate(userCredentials);
    if (validation.error) {
        console.log(validation.error.details);
        return response.sendStatus(422);
    };

    try {
        const { rows: userRegistred } = await connection.query(
            `SELECT * FROM users
            WHERE email = $1`,
            [userCredentials.email]
        )

        if (userRegistred[0] && bcrypt.compareSync(userCredentials.password, userRegistred[0].password)) {
            await connection.query(
                `INSERT INTO tokens("userId", token)
                VALUES ($1, $2)`,
                [userRegistred[0].id, addNewToken()]
            )
            return response.status(200).send({
                name: userRegistred[0].name,
                token: token
            });
        } else {
            return response.sendStatus(401);
        }

    } catch(error) {
        console.log(error);
        response.sendStatus(500);
    };
}