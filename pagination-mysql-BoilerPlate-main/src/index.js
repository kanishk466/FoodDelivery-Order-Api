const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const connection = require('./connector')


// API Endpoint for Paginated Orders
app.get("/api/orders", (req, res) => {
    let { limit, offset } = req.query;
  
    // Validate limit and offset
    limit = parseInt(limit, 10);
    offset = parseInt(offset, 10);
  
    if (isNaN(limit) || limit <= 0) {
      limit = 10; // Default value
    }
    if (isNaN(offset) || offset < 0) {
      offset = 0; // Default value
    }
  
    // SQL Query with LIMIT and OFFSET
    const query = `SELECT * FROM orders LIMIT ${limit} OFFSET ${offset}`;
    connection.query(query, (err, results) => {
      if (err) {
        console.error("Failed to fetch data:", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(200).json(results);
      }
    });
  });


app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;