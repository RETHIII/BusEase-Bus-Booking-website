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

## 🔑 Seeded Demo Accounts

The database comes pre-seeded with two accounts for easy testing:

### 👤 Customer Account
- **Email**: `john@gmail.com`
- **Password**: `password123`
- *Use this account to browse buses, select seats, fill passenger details, pay tokens, and view ticket receipts.*

### 🔑 System Admin Account
- **Email**: `admin@busbooking.com`
- **Password**: `admin123`
- *Logging in with this account reveals the **Admin Portal** link in the navigation header. Use this to view total occupancy, collected revenues, operating buses fleet lists, passenger transactions logs, and add new buses.*

---

## ☁️ How to Host the Website

Here are instructions for hosting both the database and the application on free/affordable cloud platforms (like **Render** or **Railway**):

### 1. Host the Database
You can use **Render**, **Railway**, **Supabase**, or **Neon.tech** to spin up a managed PostgreSQL database.
- Once created, copy the External Database Connection URL (e.g. `jdbc:postgresql://<host>:<port>/<dbname>`).

### 2. Hosting the Spring Boot App (e.g. on Render)
1. Push your code to a GitHub repository.
2. Sign up on [Render.com](https://render.com) and click **New > Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   - **Runtime**: `Docker` (if using a Dockerfile) or `Java` (if utilizing Render's native Java environment).
   - **Build Command**:
     ```bash
     ./mvnw clean package -DskipTests
     ```
   - **Start Command**:
     ```bash
     java -jar target/bus-booking-0.0.1-SNAPSHOT.jar
     ```
5. Add the following **Environment Variables** in Render settings to map to your production database credentials:
   - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://<production-host>:<port>/<dbname>`
   - `SPRING_DATASOURCE_USERNAME` = `your-production-db-username`
   - `SPRING_DATASOURCE_PASSWORD` = `your-production-db-password`
6. Click **Deploy Web Service**. Render will build and expose your backend along with your static frontend index at the generated URL.
