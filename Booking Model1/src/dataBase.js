const mysql = require('mysql');

// Database connection configuration
const dbConfig = {
    host: 'localhost', // or the IP address of your database server
    user: 'root', // your database username
    password: '1234', // your database password
    database: 'mechanic' // your database name
};

// Create a MySQL connection
const connection = mysql.createConnection(dbConfig);

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to database with ID ' + connection.threadId);
});

module.exports = connection;
