import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sql from 'mssql';
import path from 'path'; // Import the path module
import dotenv from 'dotenv'; // Import dotenv
import { fileURLToPath } from 'url'; // Import the fileURLToPath function

dotenv.config(); // Load .env variables

const app = express();

// Get the current directory of the module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // Extract __dirname from the module URL

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(cors());

// SQL Server Configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        enableArithAbort: true,
    },
};

// Endpoint to Add an User
app.post('/addUser', async (req, res) => {
    const { username, email, password  } = req.body;
    if (!username || !email || !password ) {
        return res.status(400).send('Username, email, and password are required.');
    }
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input('userFullName', sql.VarChar, username)
            .input('userEmail', sql.VarChar, email)
            .input('userPassword', sql.VarChar, password)
            .query('INSERT users VALUES (@userFullName, @userEmail, @userPassword)');

        res.send('User added successfully.');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error saving user to the database.');
    }
});
// Endpoint to Login with a User
app.post('/getUser', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input('userFullName', sql.VarChar, username)
            .input('userPassword', sql.VarChar, password)
            .query('SELECT * FROM users WHERE userFullName = @userFullName AND userPassword = @userPassword');

        if (result.recordset.length > 0) {
            res.status(200).send('Login successful.');
        } else {
            res.status(401).send('Invalid username or password.');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error checking the user in the database.');
    }
});

// Start Server
const PORT = 3005;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});