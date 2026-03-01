const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

// In-memory "database"
const payments = {};       // paymentId -> payment object
const ledger = {};         // paymentId -> ledger entry
const idem = {};           // idempotencyKey -> payment object

// 1) Create payment intent (status = pending)
// If Idempotency-Key is repeated, return same payment (no duplicates).
app.post("/payments/intent", (req, res) => {
  const { amount } = req.body;
  const idempotencyKey = req.header("Idempotency-Key");

  if (!amount) return res.status(400).json({ error: "amount is required" });

  // If client retries with same key, return the same payment
  if (idempotencyKey && idem[idempotencyKey]) {
    return res.json(idem[idempotencyKey]);
  }

 const paymentId = crypto.randomUUID();
  const payment = { id: paymentId, amount, status: "pending" };

  payments[paymentId] = payment;
  if (idempotencyKey) idem[idempotencyKey] = payment;

  res.json(payment);
});

// 2) Confirm a payment (status = success) + write to ledger
app.post("/payments/confirm/:id", (req, res) => {
  const payment = payments[req.params.id];
  if (!payment) return res.status(404).json({ error: "payment not found" });

  payment.status = "success";

  // Ledger integrity idea: record the credit once
  ledger[payment.id] = { credit: payment.amount, timestamp: new Date().toISOString() };

  res.json(payment);
});

// 3) Read ledger entry for a payment
app.get("/ledger/:id", (req, res) => {
  const entry = ledger[req.params.id];
  if (!entry) return res.status(404).json({ error: "ledger entry not found" });
  res.json(entry);
});

// 4) Webhook endpoint (simulates gateway callback)
// If webhook is sent twice, do NOT double-credit (basic replay protection).
app.post("/webhooks/payment", (req, res) => {
  const { paymentId } = req.body;
  const payment = payments[paymentId];
  if (!payment) return res.status(404).json({ error: "payment not found" });

  if (payment.status !== "success") {
    payment.status = "success";
    ledger[payment.id] = { credit: payment.amount, timestamp: new Date().toISOString() };
  }

  res.json({ received: true });
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(3000, () => console.log("Merchant service running on http://localhost:3000"));