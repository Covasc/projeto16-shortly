import connection from "../db.js";

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
