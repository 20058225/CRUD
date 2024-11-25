const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const app = express();

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create MySQL connection pool
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

// Endpoint to add a user
app.post('/addUser', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    try {
        const query = 'INSERT INTO users (userFullName, userEmail, userPassword) VALUES (?, ?, ?)';
        const [result] = await promisePool.execute(query, [username, email, password]);

        res.status(201).json({ message: 'User added successfully', userId: result.insertId });
    } catch (error) {
        console.error('Error adding user:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to authenticate a user
app.post('/getUser', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const query = 'SELECT * FROM users WHERE userFullName = ? AND userPassword = ?';
        const [rows] = await promisePool.execute(query, [username, password]);

        if (rows.length > 0) {
            res.status(200).json({ message: 'Login successful', user: rows[0] });
        } else {
            res.status(401).json({ message: 'Invalid username or password.' });
        }
    } catch (error) {
        console.error('Error authenticating user:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
