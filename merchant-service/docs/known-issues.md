# Known Issues

## Payment Intent Validation Missing

### Description
The `/payments/intent` endpoint accepts invalid inputs such as:
- zero amount
- negative amount
- missing email
- missing reference

### Expected Behavior
The API should return HTTP 400 Bad Request for invalid inputs.

### Actual Behavior
The API returns HTTP 200 OK and processes the request.

### Impact
Invalid payment requests may be accepted and processed, which is risky for a payment system.

### Detected By
Postman + Newman data-driven negative test suite using CSV test data.

## Idempotency Not Enforced

### Description
The `/payments/intent` endpoint does not enforce idempotency.

Sending the same request with the same reference multiple times creates new payment records.

### Expected Behavior
Repeated requests with the same reference should return the same payment result (same ID).

### Actual Behavior
Each request returns a different payment ID, indicating duplicate payments are created.

### Impact
This can lead to:
- duplicate charges
- financial inconsistencies
- reconciliation issues

### Detected By
Postman + Newman idempotency test using duplicate CSV dataset.
