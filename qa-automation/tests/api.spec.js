const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test("health check", async ({ request }) => {
  const res = await request.get(`${BASE_URL}/health`);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.ok).toBe(true);
});

test("idempotency: same key returns same payment id", async ({ request }) => {
    const key = "key-" + Date.now();
  const payload = { amount: 100 };

  const r1 = await request.post(`${BASE_URL}/payments/intent`, {
    data: payload,
    headers: { "Idempotency-Key": key },
  });
  expect(r1.ok()).toBeTruthy();
  const p1 = await r1.json();

  const r2 = await request.post(`${BASE_URL}/payments/intent`, {
    data: payload,
    headers: { "Idempotency-Key": key },
  });
  expect(r2.ok()).toBeTruthy();
  const p2 = await r2.json();

  expect(p2.id).toBe(p1.id);
  expect(p1.status).toBe("pending");
});


test("confirm payment -> creates ledger entry", async ({ request }) => {
    const key = "key-" + Date.now();
    const amount = 250;
  
    // create intent
    const r1 = await request.post(`${BASE_URL}/payments/intent`, {
      data: { amount },
      headers: { "Idempotency-Key": key },
    });
    expect(r1.ok()).toBeTruthy();
    const p = await r1.json();
  
    // confirm
    const r2 = await request.post(`${BASE_URL}/payments/confirm/${p.id}`);
    expect(r2.ok()).toBeTruthy();
    const confirmed = await r2.json();
    expect(confirmed.status).toBe("success");
  
    // ledger
    const r3 = await request.get(`${BASE_URL}/ledger/${p.id}`);
    expect(r3.ok()).toBeTruthy();
    const entry = await r3.json();
    expect(entry.credit).toBe(amount);
  });
  
  test("webhook replay does not double-credit ledger", async ({ request }) => {
    const key = "key-" + Date.now();
    const amount = 300;
  
    // create intent
    const r1 = await request.post(`${BASE_URL}/payments/intent`, {
      data: { amount },
      headers: { "Idempotency-Key": key },
    });
    const p = await r1.json();
  
    // webhook #1 (should mark success + create ledger)
    const w1 = await request.post(`${BASE_URL}/webhooks/payment`, {
      data: { paymentId: p.id },
    });
    expect(w1.ok()).toBeTruthy();
  
    const l1 = await request.get(`${BASE_URL}/ledger/${p.id}`);
    const entry1 = await l1.json();
  
    // webhook #2 replay (should NOT change ledger)
    const w2 = await request.post(`${BASE_URL}/webhooks/payment`, {
      data: { paymentId: p.id },
    });
    expect(w2.ok()).toBeTruthy();
  
    const l2 = await request.get(`${BASE_URL}/ledger/${p.id}`);
    const entry2 = await l2.json();
  
    expect(entry2.credit).toBe(entry1.credit);
    expect(entry2.timestamp).toBe(entry1.timestamp);
  });