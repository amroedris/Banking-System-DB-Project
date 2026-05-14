const express = require("express");
const cors = require("cors");
const { initDatabase } = require("./database-init");
const routes = require("./routes/index");
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// Use all routes from the MVC structure
app.use(routes);

// 404 handler for unknown routes — must come after all route definitions
app.use(notFoundHandler);

// Global error handler — must come last
app.use(errorHandler);

// Initialize database on server startup
initDatabase()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch(err => {
    console.error("Failed to initialize database. Server not started:", err);
    process.exit(1);
  });
