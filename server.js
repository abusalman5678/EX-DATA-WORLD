const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    app: "EX-DATA WORLD",
    backend: "online"
  });
});

app.get("/", (req, res) => {
  res.send("EX-DATA WORLD Backend is running.");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`EX-DATA WORLD backend running on port ${PORT}`);
});
