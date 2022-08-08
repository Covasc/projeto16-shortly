import joi from "joi";
import { nanoid } from "nanoid";
import connection from "../db.js";

export async function postUrl (request, response) {
    
    const URL = request.body;
    const { authorization } = request.headers;
    const token = authorization?.replace('Bearer ', '');

    const entrySchema = joi.object({
        url: joi.string().pattern(/^https:/).required()
    });
    const validation = entrySchema.validate(URL);
    if (validation.error) {
        console.log(validation.error.details);
        return response.sendStatus(422);
    };

    try {
        const { rows: userToken } = await connection.query(
            `SELECT * FROM tokens
            WHERE token = $1`,
            [token]
        );

        if (userToken[0]) {
            const shortUrl = nanoid(10);
            await connection.query(
                `INSERT INTO links("creatorId", url, "shortUrl")
                VALUES ($1, $2, $3)`,
                [userToken[0].userId, URL.url, shortUrl]
            )
            return response.status(201).send({
                shortUrl: shortUrl
            });
        } else {
            return response.sendStatus(401);
        };

    } catch(error) {
        console.log(error);
        return response.sendStatus (500);
    }
}

export async function deleteUrl (request, response) {

    const id = Number(request.params.id);
    const { authorization } = request.headers;
    const token = authorization?.replace('Bearer ', '');

    try {
        const { rows: userToken } = await connection.query(
            `SELECT * FROM tokens
            WHERE token = $1`,
            [token]
        );

        const { rows: link } = await connection.query(
            `SELECT * FROM links
            WHERE id = $1`,
            [id]
        )

        if (!link[0]) {
            return response.sendStatus(404);
        }
        
        if (userToken[0] && userToken[0].userId == link[0].creatorId) {
            await connection.query(
                `DELETE FROM links
                WHERE id = $1`,
                [id]
            )
            return response.sendStatus(204);
        } else {
            return response.sendStatus(401);
        }

    } catch(error) {
        console.log(error);
        return response.sendStatus(500);
    }
}