import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const connection = new Pool ({
    connectionString: process.env.POSTGRES_URI
});

export default connection;