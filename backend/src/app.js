const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { APP_NAME, API_VERSION } = require("./config/constants");

const routes = require("./routes");

const notFoundHandler = require("./middleware/notFoundHandler");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    application: APP_NAME,
    version: API_VERSION,
    message: "ZaadMart API is running",
  });
});

app.use("/api", routes);

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;