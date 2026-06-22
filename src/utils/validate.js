function validateInvoicePayload(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Request body must be a JSON object"] };
  }

  if (!body.customerName || typeof body.customerName !== "string" || !body.customerName.trim()) {
    errors.push("customerName is required and must be a non-empty string");
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push("items is required and must be a non-empty array");
  } else {
    body.items.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        errors.push(`items[${index}] must be an object`);
        return;
      }
      if (!item.name || typeof item.name !== "string" || !item.name.trim()) {
        errors.push(`items[${index}].name is required`);
      }
      const qty = Number(item.qty);
      if (!Number.isFinite(qty) || qty <= 0) {
        errors.push(`items[${index}].qty must be a positive number`);
      }
      const price = Number(item.price);
      if (!Number.isFinite(price) || price < 0) {
        errors.push(`items[${index}].price must be a non-negative number`);
      }
    });
  }

  if (body.total !== undefined && body.total !== null) {
    const total = Number(body.total);
    if (!Number.isFinite(total) || total < 0) {
      errors.push("total must be a non-negative number when provided");
    }
  }

  return { valid: errors.length === 0, errors };
}

function normalizeInvoicePayload(body) {
  const items = (body.items || []).map((item) => {
    const qty = Number(item.qty);
    const price = Number(item.price);
    return {
      name: String(item.name).trim(),
      qty,
      price,
      lineTotal: qty * price,
    };
  });

  const computedTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const total =
    body.total !== undefined && body.total !== null
      ? Number(body.total)
      : computedTotal;

  return {
    customerName: String(body.customerName).trim(),
    invoiceNumber: body.invoiceNumber ? String(body.invoiceNumber) : null,
    date: body.date ? String(body.date) : new Date().toISOString().slice(0, 10),
    currency: body.currency ? String(body.currency) : "THB",
    items,
    subtotal: computedTotal,
    total,
    notes: body.notes ? String(body.notes) : null,
  };
}

module.exports = { validateInvoicePayload, normalizeInvoicePayload };
