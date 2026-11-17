const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ai_job_system"
});

connection.connect(function(error) {
    if (error) {
        console.log("Database connection failed!");
        console.log(error.message);
    } else {
        console.log("Database connected successfully!");
    }
});

module.exports = connection;