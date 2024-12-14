const express = require('express');
const bodyParser = require("body-parser");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const connection = require('./connector');

const app = express();
const port = 8080;

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Restaurant Orders API",
      version: "1.0.0",
      description: "API to fetch restaurant orders with pagination.",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ["./index.js"], // Path to the API docs (use the filename of this file)
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Fetch paginated orders
 *     description: Fetch orders from the database with optional limit and offset parameters for pagination.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           description: Maximum number of records to fetch (default is 10).
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           description: Number of records to skip before starting to fetch (default is 0).
 *     responses:
 *       200:
 *         description: A list of orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Order ID.
 *                   title:
 *                     type: string
 *                     description: Title of the order.
 *                   description:
 *                     type: string
 *                     description: Description of the order.
 *       500:
 *         description: Internal Server Error.
 */

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

// Start the server
app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;
