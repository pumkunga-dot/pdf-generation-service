const express = require("express");
const pdfRoute = require("./routes/pdf");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "pdf-generator-service",
    version: "2.0.0",
  });
});

app.use("/", pdfRoute);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`PDF Generator Service listening on http://localhost:${PORT}`);
});
