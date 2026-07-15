# BharatBus - Smoke Testing Checklist

This checklist contains high-level, critical test cases that must be executed immediately on every build/deployment. The goal of Smoke Testing is to verify that the application compiles, starts up, and the main user flow is operational before initiating deeper testing.

## Document Metadata
* **Project Name**: BharatBus Booking & Reservation System
* **Version**: 1.0.0
* **Last Updated**: July 10, 2026

---

## Smoke Test Cases

- [ ] **SMOKE-01: Build and Launch**
  - **Objective**: Verify the application builds and the web server starts up successfully.
  - **Steps**: Run the application `./mvnw spring-boot:run` and verify that the console logs show `Started BusBookingApplication`.
  - **Expected**: App starts up without crashes, database seeds cleanly, and HTTP port 8080 is listening.

- [ ] **SMOKE-02: Homepage Access**
  - **Objective**: Verify that the homepage is accessible and assets load correctly.
  - **Steps**: Navigate to `http://localhost:8080/` in the browser.
  - **Expected**: The homepage loads quickly, and CSS, icons, font assets, and JavaScript file load without `404` errors in the console.

- [ ] **SMOKE-03: User Login (Happy Path)**
  - **Objective**: Verify that user login works with valid pre-seeded user credentials.
  - **Steps**: Navigate to login page, enter valid email and password, click "Login".
  - **Expected**: Login is successful, redirect to home page, user profile name appears in the top header.

- [ ] **SMOKE-04: Bus Search**
  - **Objective**: Verify that searching for buses on a valid route returns results.
  - **Steps**: Select Source: "Delhi", Destination: "Bangalore", Date: valid future date, and click "Search Buses".
  - **Expected**: Redirects to search results and displays available buses.

- [ ] **SMOKE-05: Seat Map Display**
  - **Objective**: Verify that seat map drawer opens and displays seat layout.
  - **Steps**: Click "Show Seats" on one of the search result bus cards.
  - **Expected**: The drawer expands showing the seat grid (seater/sleeper layout) with driver cabin and steering wheel.

- [ ] **SMOKE-06: Booking Flow (Mock Payment)**
  - **Objective**: Verify that the checkout form can be submitted and a booking is generated.
  - **Steps**: Select an available seat, enter mock passenger info, proceed to pay, and submit mock payment.
  - **Expected**: Redirect to confirmation page, display of unique Booking ID and PNR.
