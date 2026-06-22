const http = require("http");
const fs = require("fs");
const path = require("path");

const payload = JSON.stringify({
  customerName: "John Doe",
  invoiceNumber: "TEST-001",
  date: "2026-06-22",
  items: [
    { name: "Laptop", qty: 1, price: 30000 },
    { name: "Mouse", qty: 2, price: 500 },
  ],
  total: 31000,
});

const outputPath = path.join(__dirname, "..", "smoke-test-output.pdf");

const req = http.request(
  {
    hostname: "localhost",
    port: process.env.PORT || 3000,
    path: "/generate-pdf",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  },
  (res) => {
    const chunks = [];
    res.on("data", (chunk) => chunks.push(chunk));
    res.on("end", () => {
      const buffer = Buffer.concat(chunks);
      if (res.statusCode !== 200) {
        console.error("Smoke test failed:", res.statusCode, buffer.toString("utf8"));
        process.exit(1);
      }
      if (!buffer.slice(0, 4).equals(Buffer.from("%PDF"))) {
        console.error("Smoke test failed: response is not a PDF");
        process.exit(1);
      }
      fs.writeFileSync(outputPath, buffer);
      console.log(`Smoke test passed. Wrote ${outputPath} (${buffer.length} bytes)`);
    });
  }
);

req.on("error", (error) => {
  console.error("Smoke test failed:", error.message);
  process.exit(1);
});

req.write(payload);
req.end();
