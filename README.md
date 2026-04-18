

# Fintech QA Automation Lab (Payments)

![CI - Fintech QA](https://github.com/Adeleke-dev/fintech-lab/actions/workflows/ci.yml/badge.svg)

## 🧰 Tech Stack

* Node.js
* Docker Compose
* Playwright
* Postman
* Newman
* GitHub Actions

---

## 💼 Portfolio Highlights

This project demonstrates:

* containerized service validation
* API regression automation with Newman
* data-driven testing using CSV datasets
* negative testing for validation gaps
* idempotency testing for duplicate-payment risk
* CI pipeline design with blocking vs non-blocking suites
* HTML report generation and artifact upload

---

## 🗣️ Interview Summary

Built a production-style QA automation project for a merchant payment service using Docker Compose, Playwright, Postman, Newman, and GitHub Actions. The project validates happy-path payment flows, uncovers validation defects through negative testing, and identifies idempotency risks that could lead to duplicate charges. CI was designed to separate critical blocking tests from defect-detection suites, while still preserving test evidence through uploaded reports.


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

### 3. Idempotency Tests (non-blocking)

Ensures duplicate requests do not create duplicate payments.

* Same idempotency key → should return same payment ID
  
These tests validate duplicate-request protection and help surface payment integrity risks without blocking the full pipeline.

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

## 🚨 Quality Risks Validated

### Idempotency protection

**Expected:**
Repeated requests with the same idempotency key should return the same payment ID


**Actual:**
Repeated requests return the same payment object instead of creating duplicates


**Impact prevented:**

* Duplicate charges
* Financial inconsistencies
* Reconciliation issues

**Validated via:**
Newman data-driven tests using duplicate datasets

---

## ▶️ How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Adeleke-dev/fintech-lab.git
cd fintech-lab
```

### 2. Start the merchant service and Playwright tests with Docker Compose

```bash
docker compose up --build --exit-code-from tests
```

This will:

* build the `merchant` service
* run the `tests` container
* return the test exit status

---

### 3. Run Newman positive API tests locally

```bash
cd merchant-service
newman run postman/merchant-service-regression.postman_collection.json \
  -e postman/merchant-local.postman_environment.json \
  --folder "Positive Tests"
```

---

### 4. Run data-driven negative tests

```bash
newman run postman/merchant-service-regression.postman_collection.json \
  -e postman/merchant-local.postman_environment.json \
  -d tests/data/payment-intents-invalid.csv \
  --folder "Negative Tests"
```

---

### 5. Run idempotency tests

```bash
newman run postman/merchant-service-regression.postman_collection.json \
  -e postman/merchant-local.postman_environment.json \
  -d tests/data/payment-intents-duplicate.csv \
  --folder "POST /payments/intent - idempotency"
```

---

## 📁 Key Artifacts

* `merchant-service/reports/day1-newman-report.html`
* `merchant-service/reports/day3-data-driven-report.html`
* `merchant-service/reports/day4-negative-validation-report.html`
* `merchant-service/reports/day5-idempotency-report.html`

---

## 🧠 Notes

* Positive tests are expected to pass
* Negative tests are used to expose validation gaps and edge-case defects
* Idempotency tests validate duplicate-request protection
* CI is configured so critical regression checks remain blocking, while exploratory defect-detection suites can still run and publish evidence


```
```



