# BharatBus - High-Risk Scenarios (Pre-Production Checklist)

This document highlights critical, high-risk scenarios in the BharatBus system. These scenarios represent functionalities that could lead to financial loss, legal/compliance liabilities, severe security breaches, or complete system downtime. They **must** be successfully verified prior to any production launch.

---

## 1. Security & Data Vulnerabilities
### Risk: Data Breach, Unauthorized Privilege Escalation

* **Scenario HR-SEC-01: Admin Credentials Leakage in Chatbot / Public Assets**
  * **Risk**: Normal users acquiring administrative credentials, accessing private customer profiles, routes, or sales dashboards.
  * **Critical Check**: Verify that searching or clicking chatbot options never prints the raw credentials of the admin account. Ensure that `/admin` and `/api/admin/**` endpoints reject non-ADMIN JWT tokens.
* **Scenario HR-SEC-02: SQL Injection & Cross-Site Scripting (XSS)**
  * **Risk**: Execution of arbitrary database commands or malicious scripts within client sessions.
  * **Critical Check**: Verify that searching for routes with single quotes (e.g., `' OR 1=1`) doesn't trigger server-side errors, and passenger details input fields parse tags as plain text.

---

## 2. Seat Lock & Concurrent Bookings
### Risk: Double Seat Allocations, Customer Dissatisfaction

* **Scenario HR-CON-01: Simultaneous Booking of the Same Seat**
  * **Risk**: Multiple users paying for and booking the same seat.
  * **Critical Check**: Execute automated/manual tests where two clients submit payment for the exact same seat (`Bus ID` + `Seat Number`) at the same instant. Verify that the system handles concurrency via database-level locking or optimistic locks, successfully confirming one ticket and rolling back the second transaction with a refund.
* **Scenario HR-CON-02: Locked Seat State Release on Failure**
  * **Risk**: Seats remain locked indefinitely when a user abandons their checkout or a payment fails, leading to lost revenue.
  * **Critical Check**: Verify that seats are released back to the "Available" pool if the user closes the browser window, cancels payment, or if the booking timeout (e.g., 10 mins) expires.

---

## 3. Financial Transactions & Integrity
### Risk: Duplicate Payments, Failed Bookings with Successful Charges

* **Scenario HR-FIN-01: Double Submission of Payment Form**
  * **Risk**: Users being charged twice due to double-clicking the confirmation button.
  * **Critical Check**: Verify that the checkout form submit button is disabled immediately upon click, and that duplicate API requests with the same idempotency key/booking details are rejected.
* **Scenario HR-FIN-02: Network Disconnect During Payment Process**
  * **Risk**: Payment gateway deducts money, but the disconnect prevents the backend from receiving the confirmation, leaving the booking in "Pending" status and seats released.
  * **Critical Check**: Simulate connection drop at the exact moment of payment request. Verify that the backend checks payment gateway status asynchronously or retries confirmation once the connection is restored before releasing the seats.

---

## 4. System Stability & Rollbacks
### Risk: Database Corruption, Orphaned Seats

* **Scenario HR-SYS-01: Transaction Integrity & Partial Booking Fails**
  * **Risk**: Database writes the booking seat record but fails to write the main booking log, leaving the seat blocked but unretrievable.
  * **Critical Check**: Ensure `@Transactional` boundaries are correctly placed. Induce an error right after booking seat creation and verify that the database rolls back all database alterations cleanly.
