import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { deleteUrl, getRanking, getUrlById, getUserLinks, openShortUrl, postUrl, signIn, signUp } from "./src/controllers/authControllers.js";

const server = express();
server.use(express.json());
server.use(cors());

dotenv.config();
const PORT = process.env.PORT;

//REQUISITIONS HERE
server.post('/signup', signUp);
server.post('/signin', signIn);
server.post('/urls/shorten', postUrl);
server.get('/urls/:id', getUrlById);
server.get('/urls/open/:shortUrl', openShortUrl);
server.delete('/urls/:id', deleteUrl);
server.get('/users/me', getUserLinks);
server.get('/ranking', getRanking);

server.listen(PORT, () => {
    console.log("server running")
});