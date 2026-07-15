# BharatBus - User Acceptance Testing (UAT) Checklist

This document outlines the User Acceptance Testing (UAT) checklist for business stakeholders and users to verify that the BharatBus system meets the required business workflows and delivers a premium user experience.

## Document Metadata
* **Project Name**: BharatBus Booking & Reservation System
* **Target Audience**: Business Analysts, Client Stakeholders, Beta Users
* **Date**: July 10, 2026

---

## Business Scenario 1: Customer Journey (Booking a Ticket)
Verify that a typical customer can search, customize, and purchase bus tickets without assistance.

- [ ] **UAT-01.1: Responsive Search and View**
  - **Description**: Search for a bus on a mobile, tablet, or desktop device.
  - **Acceptance Criteria**: The user interface dynamically adjusts to the viewport. Form fields, menus, and booking info do not overflow.
- [ ] **UAT-01.2: Intuitive Seat Layout Selection**
  - **Description**: Select and book a sleeper seat or seater seat.
  - **Acceptance Criteria**: The seat layout design is clean and resembles modern booking portals. Sleeper berths have distinct pillow indicators, and seater seats have backrests.
- [ ] **UAT-01.3: Booking and PNR Confirmation**
  - **Description**: Proceed through checkout, inputting passenger details and submitting a payment.
  - **Acceptance Criteria**: A clear booking confirmation displays a unique Booking ID and PNR immediately. An confirmation email is received.

---

## Business Scenario 2: Booking Management (Modifying & Cancellation)
Verify that customers have control over their scheduled journeys.

- [ ] **UAT-02.1: View Booking History**
  - **Description**: Access past and upcoming journeys under "My Bookings".
  - **Acceptance Criteria**: All booking details (seat numbers, fare, route, time) are listed clearly.
- [ ] **UAT-02.2: Cancel Ticket and Refund Validation**
  - **Description**: Initiate cancellation of an upcoming ticket.
  - **Acceptance Criteria**: The ticket status changes to "CANCELLED" immediately. The seats are released to the pool, and the system confirms the refund amount based on cancellation policy rules.

---

## Business Scenario 3: Admin Operations
Verify that administrators can manage records and check active logins safely.

- [ ] **UAT-03.1: Admin Dashboard Access**
  - **Description**: Log in as an administrator (`admin@busbooking.com` / `admin123`) and view users, routes, and statistics.
  - **Acceptance Criteria**: Administrative views (charts, customer registration list) load correctly.
- [ ] **UAT-03.2: Security & Credentials Restrictive Access**
  - **Description**: A normal user queries the chatbot for "admin credentials".
  - **Acceptance Criteria**: The chatbot **must not** reveal the admin password. The Admin portal link is hidden from standard client headers.

---

## Business Scenario 4: Account Recovery (Forgot Password)
Verify that users can recover their accounts securely using their phone number.

- [ ] **UAT-04.1: Phone-based Dynamic OTP**
  - **Description**: Click "Forgot Password", enter a registered phone number, click "Send OTP", verify dynamic OTP display, and reset password.
  - **Acceptance Criteria**: OTP code is generated dynamically on the backend (different code on consecutive clicks), and password updates successfully.
