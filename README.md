![CI](https://github.com/Adeleke-dev/fintech-lab/actions/workflows/ci.yml/badge.svg)

## Fintech QA Automation Lab (Payments)
# Fintech QA Automation Lab (Payments)

A production-style QA automation project for a merchant payment service, focused on **API reliability, data integrity, and CI-driven validation**.

This project demonstrates how a QA engineer validates critical payment flows using:

* Dockerized services (realistic environment)
* Playwright (service-level testing via Compose)
* Postman + Newman (API validation)
* Data-driven testing (CSV inputs)
* CI/CD pipelines (GitHub Actions)
* Failure-tolerant test strategy (positive vs negative vs idempotency)

---

## 🎯 Objective

To simulate how QA engineers in fintech systems ensure:

* Payments are processed correctly
* Duplicate transactions are prevented
* Invalid inputs are rejected
* System behavior is consistent across environments
* Regressions are automatically detected in CI

---

## 🧪 Testing Strategy

This project separates tests into three categories:

### 1. Positive Tests (must pass)

Valid payment flows that must always succeed.

* Health check endpoint
* Valid payment intent creation

👉 These tests **fail the pipeline if broken**

---

### 2. Negative Tests (allowed to fail)

Invalid inputs to ensure proper validation.

* Missing fields
* Invalid data formats

👉 These tests **detect validation issues but do not block CI**

---

### 3. Idempotency Tests (allowed to fail)

Ensures duplicate requests do not create duplicate payments.

* Same reference → should return same payment ID

👉 These tests help detect **financial risk bugs**

---

## ⚙️ CI Pipeline Overview

The pipeline runs in stages:

1. Build and run services using Docker Compose
2. Execute service-level tests
3. Start API service for external testing
4. Run Newman test suites:

   * Positive (blocking)
   * Negative (non-blocking)
   * Idempotency (non-blocking)
5. Upload HTML reports as artifacts

---

## 📊 Reporting

Each CI run generates structured HTML reports:

* Positive test report
* Negative validation report
* Idempotency report

These reports provide:

* Assertion results
* Response payloads
* Performance timing

---

## 🚨 Known Issues Detected

### Idempotency Failure

**Expected:**
Repeated requests with the same reference should return the same payment ID

**Actual:**
Each request returns a different payment ID

**Impact:**

* Duplicate charges
* Financial inconsistencies
* Reconciliation issues

**Detected via:**
Newman data-driven tests using duplicate datasets

---

### Run locally
```bash
docker compose up --build --exit-code-from tests


