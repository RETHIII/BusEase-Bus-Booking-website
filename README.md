# BusEase - Premium Bus Booking & Reservation System

BusEase is a modern, single-page web application (SPA) built using **Spring Boot** for the backend REST API, **Spring Security with JWT** for authentication, **Spring Data JPA** with **PostgreSQL** for persistence, and **Vanilla HTML5/CSS3/JS** (incorporating redBus-style interactive seat mapping and fully responsive viewports) for the frontend.

---

## 🛠️ Technology Stack
- **Backend Framework**: Spring Boot 3.3.0
- **Language**: Java 17
- **Database**: PostgreSQL (with automatic schema updates & seeding via `data.sql`)
- **Security**: JWT (JSON Web Tokens) & Spring Security
- **Frontend**: Vanilla JS (SPA architecture), CSS3, HTML5 (Outfit Google Font, responsive grid styling)

---

## 💻 How to Run the Project Locally

Follow these steps to set up and launch BharatBus on your laptop:

### 1. Prerequisites
Ensure you have the following installed:
- **Java JDK 17** (or higher)
- **PostgreSQL Database Server**
- **Git** (optional)

### 2. Database Configuration
1. Open your PostgreSQL client (pgAdmin, DBeaver, or psql terminal).
2. Create a new database named **`bus_booking`**:
   ```sql
   CREATE DATABASE bus_booking;
   ```
3. By default, the application is configured to connect to PostgreSQL at `localhost:5432` with username `postgres` and password `root`. If your PostgreSQL setup uses different credentials, open the [application.properties](src/main/resources/application.properties) file and update the following lines:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/bus_booking
   spring.datasource.username=YOUR_POSTGRES_USER
   spring.datasource.password=YOUR_POSTGRES_PASSWORD
   ```

### 3. Running the Server
You do not need to install Maven. A Maven Wrapper is included in the project directory.

1. Open your terminal (PowerShell, Command Prompt, or bash) and navigate to the project directory.
2. Run the following command:
   - **Windows (PowerShell)**:
     ```powershell
     .\ mvnw spring-boot:run
     ```
   - **Windows (CMD)**:
     ```cmd
     mvnw spring-boot:run
     ```
   - **Linux / macOS**:
     ```bash
     chmod +x mvnw
     ./mvnw spring-boot:run
     ```
3. The server will download the required dependencies, compile the source files, run the database seeding migrations, and start up.
4. Once you see `Started BusBookingApplication in ... seconds` in the log, open your web browser and navigate to:
   ```
   http://localhost:8080
   ```

---
## 🌐 Live Demo

Experience the deployed application here:

🔗 https://busease-bus-booking-website.onrender.com

> Hosted on Render (Free Tier). The first request after inactivity may take around 30–60 seconds while the server wakes up.

## Output Images 

<img width="1920" height="1080" alt="Screenshot (137)" src="https://github.com/user-attachments/assets/08aa4f66-9de3-4c7e-ad01-4278e1c71eb7" />


<img width="1920" height="1080" alt="Screenshot (145)" src="https://github.com/user-attachments/assets/c4834769-d35d-4d65-8038-bb997b27101a" />
