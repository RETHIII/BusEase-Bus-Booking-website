# BharatBus - Regression Testing Checklist

This checklist defines the critical areas and test cases that must be executed during regression testing rounds to ensure that code modifications, bug fixes, or enhancements do not negatively impact existing functionalities.

## Document Metadata
* **Project Name**: BharatBus Booking & Reservation System
* **Version**: 1.0.0
* **Last Updated**: July 10, 2026

---

## 1. Authentication & Session Management
- [ ] **TC-REG-01**: Verify that existing users can log in successfully with valid credentials.
- [ ] **TC-REG-02**: Verify that newly registered users can log in without issues.
- [ ] **TC-REG-03**: Verify that JWT tokens are stored securely (localStorage/sessionStorage) and sent in the `Authorization` header for API calls.
- [ ] **TC-REG-04**: Verify that logging out successfully destroys the active session and prevents back-button navigation to private areas.
- [ ] **TC-REG-19**: Verify that forgot password OTPs are dynamically generated on the backend and validated using phone numbers.

## 2. Bus Search & Filters
- [ ] **TC-REG-05**: Verify that users can search for buses between valid cities.
- [ ] **TC-REG-06**: Verify that filter categories (Bus Type, Departure Time) dynamically filter results without reload.
- [ ] **TC-REG-07**: Verify that sorting (Price, Duration) arranges the bus listings correctly.

## 3. Interactive Seating Layout & Reservation
- [ ] **TC-REG-08**: Verify that seat layout mapping renders correctly based on the bus type (seater vs. sleeper dimensions, pillows, and headrests).
- [ ] **TC-REG-09**: Verify that seat states (Available, Booked, Selected) update instantly upon user interactions.
- [ ] **TC-REG-10**: Verify that multi-seat selections accumulate the prices correctly.
- [ ] **TC-REG-11**: Verify that seat deselection works and correctly decrements the total price.

## 4. Checkout & Booking Transaction
- [ ] **TC-REG-12**: Verify that passenger details forms collect names, age, and gender correctly.
- [ ] **TC-REG-13**: Verify that booking creates a unique booking ID and PNR in the database.
- [ ] **TC-REG-14**: Verify that double-submits during booking creation are blocked.
- [ ] **TC-REG-15**: Verify that concurrent booking attempts on the same seat reject the slower transaction and roll it back.

## 5. Security & RBAC
- [ ] **TC-REG-16**: Verify that normal users cannot access the Admin panel (`/admin` or admin API endpoints).
- [ ] **TC-REG-17**: Verify that chatbot queries containing security credentials keywords (e.g., admin, credentials, password) **do not** reveal the actual login details.
- [ ] **TC-REG-18**: Verify that query inputs are sanitized against SQL injection and XSS scripts.
