# PDF Generator Service

นี่คือบริการ Express ขนาดเล็ก ที่ทำหน้าที่สร้างไฟล์ PDF ใบแจ้งหนี้จากข้อมูล JSON โดยใช้เทมเพลต Handlebars และแปลงเป็น PDF ด้วย PDFKit แล้วส่งกลับไปให้ผู้ใช้งานดาวน์โหลดทันที

## สิ่งที่มีให้
- โค้ดทั้งหมดอยู่ใน repository นี้
- README นี้อธิบายวิธีใช้งานและ API

## ตัดสินใจใช้เทคโนโลยี
- PDF renderer: ใช้ `pdfkit` เป็นหลัก เพราะเบาและติดตั้งง่าย
- เทมเพลต: ใช้ `handlebars` เพื่อแยกข้อมูล JSON ออกจากรูปแบบเอกสาร

## เหตุผล
- `pdfkit` ทำงานแบบ pure Node และเขียนผลลัพธ์ไปยัง HTTP response ได้ทันที
- ไม่ต้องใช้เบราว์เซอร์หรือ Chromium ทำให้ใช้งานง่ายและเร็วกว่าในหลายกรณี
- ถ้าต้องการ HTML/CSS ที่ปรับแต่งละเอียด ก็สามารถขยายให้ใช้ `puppeteer` ในอนาคตได้

## ระบบทำงานอย่างไร
1. รับข้อมูลผ่าน API `POST /generate-pdf` โดยส่ง JSON ที่มีฟิลด์ เช่น `customerName`, `items`, `total`
2. เซิร์ฟเวอร์จะนำข้อมูลไปแปลงด้วยเทมเพลต Handlebars ใน `src/templates/invoice.hbs`
3. แล้วสร้าง PDF ด้วย `pdfkit` และส่งกลับพร้อม header `Content-Type: application/pdf` และ `Content-Disposition`

## วิธีใช้งาน
1. ติดตั้ง dependencies:

```bash
npm install
```

2. เริ่มเซิร์ฟเวอร์:

```bash
npm run dev
```

3. เปิดหน้าทดสอบในเบราว์เซอร์:

```
http://localhost:3000/generate-pdf
```

บนหน้านี้คุณสามารถ:
- กดปุ่ม `Download sample invoice (GET)` เพื่อดาวน์โหลด PDF ตัวอย่างจาก `GET /pdf/invoice`
- กรอกฟอร์ม แล้วกด `Send JSON POST` เพื่อส่ง `POST /generate-pdf` และดาวน์โหลด PDF ที่สร้างจากข้อมูล

## API ที่ใช้ได้
- `GET /generate-pdf` — หน้า UI สำหรับทดสอบ
- `GET /pdf/invoice` — ดาวน์โหลดตัวอย่าง PDF แบบสำเร็จรูป
- `POST /generate-pdf` — API หลัก รับ JSON แล้วคืน PDF
- `POST /generate-pdf-html` — อีก endpoint ที่รองรับการเรียกแบบ HTML renderer (ปัจจุบันยังใช้ pdfService เดียวกัน)

ตัวอย่าง JSON สำหรับ `POST /generate-pdf`:

```json
{
  "customerName": "John Doe",
  "invoiceNumber": "1001",
  "date": "2026-06-22",
  "items": [
    { "name": "Laptop", "qty": 1, "price": 30000 },
    { "name": "Mouse", "qty": 2, "price": 500 }
  ],
  "total": 31000
}
```

ตัวอย่างคำสั่ง curl บน Windows:

```bash
curl.exe -X POST http://localhost:3000/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"customerName":"John Doe","items":[{"name":"Laptop","qty":1,"price":30000}],"total":30000}' \
  --output invoice.pdf
```

ถ้าใช้ `curl` บน Windows ให้ใช้ `curl.exe` หรือใช้ PowerShell `Invoke-WebRequest` เพื่อหลีกเลี่ยงปัญหา quote

## ทำไมเลือกแบบนี้
- `pdfkit` เหมาะกับงาน PDF ที่ต้องการสร้างเอกสารจากโค้ดแบบทำงานตรงๆ
- ถ้าอยากได้รูปแบบ HTML + CSS ที่ดูสวยขึ้นในอนาคต สามารถเพิ่ม `puppeteer` ได้ทีหลัง
- ปัจจุบันโค้ดยังทำงานได้โดยไม่ต้องติดตั้ง Chromium
data

## ถ้าอยากลองใช้งาน HTML renderer แบบเต็ม
1. ติดตั้ง dependencies ตามปกติ:

```bash
npm install
```

2. รันเซิร์ฟเวอร์:

```bash
npm run dev
```

3. เรียก endpoint นี้:

```bash
curl.exe -X POST http://localhost:3000/generate-pdf-html \
  -H "Content-Type: application/json" \
  -d '{"customerName":"John Doe","items":[{"name":"Laptop","qty":1,"price":30000}],"total":30000}' \
  --output invoice.pdf
```




