const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const PdfPrinter = require("pdfmake");

const { formatMoney } = require("../utils/format");

const templatePath = path.join(__dirname, "..", "templates", "invoice.hbs");
const templateSource = fs.readFileSync(templatePath, "utf8");
const metadataTemplate = Handlebars.compile(templateSource);

const fontsDir = path.join(__dirname, "..", "..", "assets", "fonts");

const fonts = {
  NotoSansThai: {
    normal: path.join(fontsDir, "NotoSansThai-Regular.ttf"),
    bold: path.join(fontsDir, "NotoSansThai-Bold.ttf"),
    italics: path.join(fontsDir, "NotoSansThai-Regular.ttf"),
    bolditalics: path.join(fontsDir, "NotoSansThai-Bold.ttf"),
  },
};

const printer = new PdfPrinter(fonts);

const COLORS = {
  primary: "#1d4ed8",
  primaryLight: "#dbeafe",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  rowAlt: "#f9fafb",
};

function buildItemsTable(data) {
  const { items, currency } = data;

  const header = [
    { text: "รายการ / Item", style: "tableHeader" },
    { text: "จำนวน / Qty", style: "tableHeader", alignment: "right" },
    { text: "ราคา / Price", style: "tableHeader", alignment: "right" },
    { text: "รวม / Amount", style: "tableHeader", alignment: "right" },
  ];

  const rows = items.map((item, index) => [
    { text: item.name, style: index % 2 === 0 ? "tableCell" : "tableCellAlt" },
    {
      text: String(item.qty),
      style: index % 2 === 0 ? "tableCell" : "tableCellAlt",
      alignment: "right",
    },
    {
      text: formatMoney(item.price, currency),
      style: index % 2 === 0 ? "tableCell" : "tableCellAlt",
      alignment: "right",
    },
    {
      text: formatMoney(item.lineTotal, currency),
      style: index % 2 === 0 ? "tableCell" : "tableCellAlt",
      alignment: "right",
    },
  ]);

  return {
    table: {
      headerRows: 1,
      widths: ["*", 55, 85, 95],
      body: [header, ...rows],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0,
      hLineColor: () => COLORS.border,
      paddingLeft: () => 10,
      paddingRight: () => 10,
      paddingTop: () => 8,
      paddingBottom: () => 8,
    },
    margin: [0, 12, 0, 12],
  };
}

function buildDocumentDefinition(data) {
  const metadata = metadataTemplate(data);
  const lines = metadata
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const title = lines[0] || "INVOICE";
  const customerName = lines[1] || data.customerName;
  const metaLines = lines.slice(2);

  return {
    pageSize: "A4",
    pageMargins: [40, 48, 40, 56],
    defaultStyle: {
      font: "NotoSansThai",
      fontSize: 10,
      color: COLORS.text,
      lineHeight: 1.25,
    },
    content: [
      {
        columns: [
          {
            width: "*",
            stack: [
              { text: "PDF Generator Service", style: "brand" },
              { text: title, style: "title" },
            ],
          },
          {
            width: 180,
            stack: metaLines.map((line) => ({
              text: line,
              style: "meta",
              alignment: "right",
            })),
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        canvas: [
          {
            type: "rect",
            x: 0,
            y: 0,
            w: 515,
            h: 52,
            r: 6,
            color: COLORS.primaryLight,
          },
        ],
        margin: [0, 0, 0, -44],
      },
      {
        margin: [14, 10, 14, 10],
        stack: [
          { text: "ลูกค้า / Bill To", style: "sectionLabel" },
          { text: customerName, style: "customerName" },
        ],
      },
      buildItemsTable(data),
      {
        columns: [
          { width: "*", text: "" },
          {
            width: 220,
            table: {
              widths: ["*", "auto"],
              body: [
                [
                  { text: "ยอดรวม / Subtotal", style: "summaryLabel" },
                  {
                    text: formatMoney(data.subtotal, data.currency),
                    style: "summaryValue",
                    alignment: "right",
                  },
                ],
                [
                  { text: "รวมทั้งสิ้น / Total", style: "summaryTotalLabel" },
                  {
                    text: formatMoney(data.total, data.currency),
                    style: "summaryTotalValue",
                    alignment: "right",
                  },
                ],
              ],
            },
            layout: "noBorders",
          },
        ],
      },
      data.notes
        ? {
            margin: [0, 18, 0, 0],
            stack: [
              { text: "หมายเหตุ / Notes", style: "sectionLabel" },
              { text: data.notes, style: "notes" },
            ],
          }
        : null,
      {
        margin: [0, 28, 0, 0],
        text: "ขอบคุณที่ใช้บริการ / Thank you for your business.",
        style: "footer",
        alignment: "center",
      },
    ].filter(Boolean),
    styles: {
      brand: {
        fontSize: 9,
        color: COLORS.primary,
        bold: true,
        margin: [0, 0, 0, 4],
      },
      title: {
        fontSize: 22,
        bold: true,
        color: COLORS.text,
      },
      meta: {
        fontSize: 9,
        color: COLORS.muted,
        margin: [0, 0, 0, 2],
      },
      sectionLabel: {
        fontSize: 8,
        color: COLORS.muted,
        bold: true,
        margin: [0, 0, 0, 4],
      },
      customerName: {
        fontSize: 13,
        bold: true,
      },
      tableHeader: {
        bold: true,
        fontSize: 9,
        color: "#ffffff",
        fillColor: COLORS.primary,
        margin: [0, 2, 0, 2],
      },
      tableCell: {
        fontSize: 9,
      },
      tableCellAlt: {
        fontSize: 9,
        fillColor: COLORS.rowAlt,
      },
      summaryLabel: {
        fontSize: 9,
        color: COLORS.muted,
        margin: [0, 4, 8, 4],
      },
      summaryValue: {
        fontSize: 9,
        margin: [0, 4, 0, 4],
      },
      summaryTotalLabel: {
        fontSize: 11,
        bold: true,
        margin: [0, 6, 8, 0],
      },
      summaryTotalValue: {
        fontSize: 11,
        bold: true,
        color: COLORS.primary,
        margin: [0, 6, 0, 0],
      },
      notes: {
        fontSize: 9,
        color: COLORS.text,
      },
      footer: {
        fontSize: 9,
        color: COLORS.muted,
        italics: true,
      },
    },
    info: {
      title: `Invoice-${data.invoiceNumber || "receipt"}`,
      author: "PDF Generator Service",
    },
  };
}

function generatePdfBuffer(data) {
  const docDefinition = buildDocumentDefinition(data);

  return new Promise((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];

    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.on("error", reject);
    pdfDoc.end();
  });
}

async function generatePdf(data, res, filename = "invoice.pdf") {
  const buffer = await generatePdfBuffer(data);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", buffer.length);
  res.send(buffer);
}

module.exports = { generatePdf, generatePdfBuffer, buildDocumentDefinition };
