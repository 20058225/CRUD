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
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
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
    const { userFullName, userPassword } = req.body;
    if (!userFullName || !userPassword) {
        return res.status(400).send('Username and password are required.');
    }
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input('userFullName', sql.VarChar, userFullName)
            .input('userPassword', sql.VarChar, userPassword)
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
// PUT route to update a user
app.put('/updateUser', async (req, res) => {
    try {
        const { userID, userFullName, userEmail, userPassword } = req.body;

        if (!userID) {
            return res.status(400).send('User ID is required to update user information.');
        }

        // Connect to the database
        const pool = await sql.connect(dbConfig);

        // Build the dynamic query
        let updateQuery = 'UPDATE users SET ';
        const updateFields = [];
        if (userFullName) updateFields.push('userFullName = @userFullName');
        if (userEmail) updateFields.push('userEmail = @userEmail');
        if (userPassword) updateFields.push('userPassword = @userPassword');

        if (updateFields.length === 0) {
            return res.status(400).send('No fields to update.');
        }

        updateQuery += updateFields.join(', ') + ' WHERE userID = @userID';

        console.log('Executing query:', updateQuery);

        // Execute the query
        const result = await pool
            .request()
            .input('userID', sql.Int, userID)
            .input('userFullName', sql.VarChar, userFullName)
            .input('userEmail', sql.VarChar, userEmail)
            .input('userPassword', sql.VarChar, userPassword)
            .query(updateQuery);

        if (result.rowsAffected[0] > 0) {
            res.send('User updated successfully.');
        } else {
            res.status(404).send('User not found.');
        }
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).send('Internal server error.');
    }
});
app.get('/searchUser', async (req, res) => {
    try {
        const { userID, userFullName } = req.query;

        if (!userID && !userFullName) { return res.status(400).send('Please provide either userID or userFullName to search.'); }

        // Connect to the database
        const pool = await sql.connect(dbConfig);

        // Build query based on parameters
        let query = 'SELECT * FROM users WHERE ';
        if (userID) {
            query += 'userID = @userID';
        } else if (userFullName) {
            query += 'userFullName LIKE @userFullName';
        }

        // Execute query
        const result = await pool
            .request()
            .input('userID', sql.Int, userID)
            .input('userFullName', sql.VarChar, `%${userFullName}%`)
            .query(query);

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]); // Send back the first match
        } else {
            res.status(404).send('User not found.');
        }
    } catch (error) {
        console.error('Error searching user:', error.message);
        res.status(500).send('Internal server error.');
    }
});

// DELETE route to delete a user
app.delete('/deleteUser', async (req, res) => {
    const { username } = req.body;

    if (!username) { return res.status(400).send('Username is required.'); }

    try {
        console.log('Request body:', req.body); // Debugging log
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input('userFullName', sql.VarChar, userFullName)
            .query('DELETE FROM users WHERE userFullName = @userFullName');

        if (result.rowsAffected[0] > 0) {
            res.status(200).send('User deleted successfully.');
        } else {
            res.status(404).send('User not found.');
        }
    } catch (err) {
        console.error('Error deleting user:', err.message);  // Log the error message
        res.status(500).send('Error deleting user from the database.');
    }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});