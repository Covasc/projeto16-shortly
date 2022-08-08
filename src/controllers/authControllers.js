import joi from "joi";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
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

export async function getUrlById (request, response) {

    let id = Number(request.params.id);

    try {
        const { rows: link } = await connection.query(
            `SELECT id, "shortUrl", url FROM links
            WHERE id = $1`,
            [id]
        )

        if (!link[0]) {
            return response.sendStatus(404);
        }

        return response.status(200).send(link[0]);

    } catch(error) {
        console.log(error);
        return response.sendStatus(500);
    }
}

export async function openShortUrl (request, response) {

    let shortUrl = request.params.shortUrl;

    try {
        const { rows: link } = await connection.query(
            `SELECT * FROM links
            WHERE "shortUrl" = $1`,
            [shortUrl]
        )

        if (!link[0]) {
            return response.sendStatus(404);
        }

        await connection.query(
            `UPDATE links 
            SET hits = hits+1
            WHERE id = $1 `, 
            [link[0].id]
        )

        return response.redirect(link[0].url)

    } catch(error) {
        console.log(error);
        return response.sendStatus(500);
    };
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

export async function getUserLinks (request, response) {

    const { authorization } = request.headers;
    const token = authorization?.replace('Bearer ', '');

    try {
        const { rows: userToken } = await connection.query(
            `SELECT * FROM tokens
            WHERE token = $1`,
            [token]
        );

        if (!userToken[0]) {
            return response.sendStatus(401);
        }
        
        const { rows: user } = await connection.query(
            `SELECT users.id, users.name, COALESCE(SUM(links.hits),0) as "visitCount"
            FROM links
            RIGHT JOIN users ON links."creatorId" = users.id
            WHERE users.id = $1
            GROUP BY users.id;`,
            [userToken[0].userId]
        );

        if (!user[0]) {
            return response.sendStatus(404);
        }
        
        if (userToken[0] && userToken[0].userId == user[0].id) {
            const { rows:links } = await connection.query(
                `SELECT id, "shortUrl", url, hits as "visitCount"
                FROM links
                WHERE "creatorId" = $1
                ORDER BY id`,
                [user[0].id]
            );

            const linksList = { ...user[0],
                shortenedUrls: links}

            return response.status(200).send(linksList);
        } else {
            return response.sendStatus(401);
        }

    } catch(error) {
        console.log(error);
        return response.sendStatus(500);
    }

}

export async function getRanking (request, response) {

    try {
        const { rows: rankingList } = await connection.query(
            `SELECT users.id, users.name, COUNT(links.id) as "linksCount", COALESCE(SUM(links.hits),0) as "visitCount"
            FROM links
            RIGHT JOIN users ON links."creatorId" = users.id
            GROUP BY users.id ORDER BY "visitCount" DESC LIMIT 10;`
        );

        return response.status(200).send(rankingList);

    } catch(error) {
        console.log(error);
        return response.sendStatus(500);
    }
} 