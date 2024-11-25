const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL Configuration
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0 
});

const promisePool = pool.promise(); // Use promise-based queries

// Endpoint to Add a User
app.post('/addUser', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send('Username, email, and password are required.');
    }
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO users (userFullName, userEmail, userPassword) VALUES (?, ?, ?)',
            [username, email, password]
        );
        await connection.end();
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
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE userFullName = ? AND userPassword = ?',
            [username, password]
        );
        await connection.end();

        if (rows.length > 0) {
            res.status(200).send('Login successful.');
        } else {
            res.status(401).send('Invalid username or password.');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error checking the user in the database.');
    }
});

// Endpoint to Update a User
app.put('/updateUser', async (req, res) => {
    const { id, username, email, password } = req.body;
    if (!id || (!username && !email && !password)) {
        return res.status(400).send('User ID and at least one field to update are required.');
    }
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            `
            UPDATE users
            SET 
                userFullName = COALESCE(?, userFullName),
                userEmail = COALESCE(?, userEmail),
                userPassword = COALESCE(?, userPassword)
            WHERE userID = ?
            `,
            [username || null, email || null, password || null, id]
        );
        await connection.end();

        if (result.affectedRows > 0) {
            res.send('User updated successfully.');
        } else {
            res.status(404).send('User not found.');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error updating user.');
    }
});

// Start Server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
