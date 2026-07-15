# Bus Booking Website Optimization & Seating Redesign

This implementation plan covers making the BharatBus website fully responsive for mobile, tablet, and desktop viewports, redesigning the bus seat layouts to match the look of redBus (incorporating realistic backrests for seaters and pillows for sleepers with state-dependent coloring), scanning and fixing frontend/backend bugs, and providing clear manual deployment and hosting guidelines.

## User Review Required

> [!IMPORTANT]
> The application is configured to connect to PostgreSQL at `localhost:5432` with database name `bus_booking`, username `postgres`, and password `root`.
> To run the project locally, please ensure that PostgreSQL is running and the database `bus_booking` has been created. Alternatively, we can switch the application config to run on an in-memory H2 database for easier testing without PostgreSQL.

## Proposed Changes

We will introduce responsive rules, custom grid setups, and detailed seat rendering structures to make the website premium, responsive, and close to the redBus design.

---

### Frontend Styling & Seating Redesign

#### [MODIFY] [style.css](file:///d:/full%20stack%20development%20java/github/dummy%20website/src/main/resources/static/style.css)

- **Seating Redesign (redBus Inspired)**:
  - Redesign seater `.seat-box` to have custom dimensions (`34px` by `34px`), rounded corners, a realistic outline, and a small backrest/headrest pseudo-element (`::after`) on the right side (seats face front/left).
  - Redesign sleeper `.seat-box.sleeper-seat` to have custom sleeper dimensions (`54px` by `26px`) and an inner pillow/headrest pseudo-element on the left side.
  - Implement color themes matching redBus:
    - **Available**: Soft grey border (`#718096` or `#a0aec0`) or light green outline, with white background.
    - **Selected**: Solid primary red background (`#d84f57`) with white text and matching headrest/pillow.
    - **Booked**: Solid grey background (`#cbd5e0`), muted text (`#718096`), and greyed-out seat elements.
  - Fix driver cabin outline and steering wheel icon spacing.

- **Responsive Viewports System**:
  - Add CSS media queries for desktop (`max-width: 1024px`), tablet (`max-width: 768px`), and mobile screens (`max-width: 480px`).
  - **Search Widget**: Make the 5-column grid (`grid-template-columns: 1.2fr auto 1.2fr 1fr auto`) wrap gracefully. Stack search form components on tablet and mobile.
  - **Hero Section**: Reduce header text sizing (`font-size: 28px` on mobile) and paddings.
  - **Offers/Features**: Make the 3-column features card grid stack into 1 column on mobile.
  - **Search Results**: Stack the 280px filter sidebar vertically on tablet and mobile, or collapse it with a toggle. Make `.bus-card-primary-info` (5-column grid) stack into columns on mobile viewports so it doesn't overflow.
  - **Seat Drawer**: Stack the interactive seat layout area and the summary sidebar on smaller viewports. Ensure horizontal scroll handles the bus seating grid if the screen is narrower than the bus.
  - **Booking Details**: Stack passenger details and fare breakup sidebars on mobile. Ensure `.form-grid` wraps cleanly.
  - **Admin Dashboard**: Stack statistics cards and make tables scrollable horizontally to prevent breaking layout containers.

#### [MODIFY] [app.js](file:///d:/full%20stack%20development%20java/github/dummy%20website/src/main/resources/static/app.js)
- Check for potential bugs or discrepancies between the static code and backend endpoints.
- Adjust seat grid wrappers if needed to ensure responsiveness.

---

### Backend Configuration & Manual Run / Hosting Instructions

#### [NEW] [README.md](file:///d:/full%20stack%20development%20java/github/dummy%20website/README.md)
- Provide step-by-step instructions on:
  1. Setting up PostgreSQL (or switching to H2).
  2. Running the database initialization scripts.
  3. Starting the Spring Boot backend using Maven Wrapper `./mvnw spring-boot:run`.
  4. Accessing the UI.
  5. Guide for hosting the Spring Boot app on cloud platforms (e.g. Render, AWS, railway.app, Heroku) using Docker or direct JAR build, and hosting database.

## Verification Plan

### Manual Verification
- Test compile and build via Maven.
- Launch the application and verify all views: Search, Search Results, Seat Drawer (seater vs sleeper), Passenger details, payment modal, and ticket printing.
- Verify screen responsiveness across different viewport resolutions using developer tools simulator.
- Verify that user flows (login, register, search, booking, ticket viewing) work end-to-end without console errors.
