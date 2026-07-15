-- Seed Users (Passwords hashed using BCrypt: 'admin123' and 'password123')
INSERT INTO users (name, email, password, role, provider, created_at)
VALUES 
('System Admin', 'admin@busbooking.com', '$2a$10$L6iutQfKN9vbjN6eUf.8yOwsJV9W7NDqNvq4e.thHqHkxpoTLjCky', 'ADMIN', 'LOCAL', NOW())
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

INSERT INTO users (name, email, password, role, provider, created_at)
VALUES 
('John Doe', 'john@gmail.com', '$2a$10$ZPBCau5.8s8ROBnGo4twReyK6X4Jryo6kPCty9pKw8BISrc8abU0W', 'USER', 'LOCAL', NOW())
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

-- Seed initial Bus
INSERT INTO buses (id, bus_number, operator_name, bus_type, total_seats, price, rating)
VALUES 
(1, 'IN-45-XX-1122', 'VRL Travels', 'A/C Sleeper (2+1)', 36, 800.0, 4.3)
ON CONFLICT (bus_number) DO NOTHING;

INSERT INTO buses (id, bus_number, operator_name, bus_type, total_seats, price, rating)
VALUES 
(2, 'IN-45-YY-3344', 'Zingbus', 'Non-A/C Sleeper (2+1)', 36, 650.0, 4.1)
ON CONFLICT (bus_number) DO NOTHING;

-- Seed initial Route
INSERT INTO routes (id, source, destination, departure_time, arrival_time, duration)
VALUES 
(1, 'Mumbai', 'Pune', '08:00:00', '11:30:00', '3h 30m')
ON CONFLICT (id) DO NOTHING;

-- Seed initial Trip for Today
INSERT INTO trips (id, bus_id, route_id, departure_date, available_seats)
VALUES 
(1, 1, 1, CURRENT_DATE, 34)
ON CONFLICT (id) DO NOTHING;

INSERT INTO trips (id, bus_id, route_id, departure_date, available_seats)
VALUES 
(2, 2, 1, CURRENT_DATE, 34)
ON CONFLICT (id) DO NOTHING;

-- Seed seats for Trip 1 (L1..L18, U1..U18)
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L1', true) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L2', true) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L3', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L4', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L5', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L6', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L7', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L8', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L9', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L10', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L11', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L12', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L13', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L14', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L15', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L16', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L17', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'L18', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U1', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U2', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U3', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U4', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U5', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U6', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U7', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U8', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U9', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U10', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U11', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U12', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U13', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U14', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U15', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U16', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U17', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (1, 'U18', false) ON CONFLICT DO NOTHING;

-- Seed seats for Trip 2 (L1..L18, U1..U18)
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L1', true) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L2', true) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L3', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L4', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L5', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L6', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L7', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L8', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L9', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L10', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L11', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L12', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L13', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L14', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L15', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L16', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L17', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'L18', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U1', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U2', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U3', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U4', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U5', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U6', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U7', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U8', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U9', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U10', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U11', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U12', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U13', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U14', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U15', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U16', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U17', false) ON CONFLICT DO NOTHING;
INSERT INTO seats (trip_id, seat_number, is_booked) VALUES (2, 'U18', false) ON CONFLICT DO NOTHING;

-- Seed simulated Bookings
-- Booking 1: John Doe booked Trip 1 (Full payment: ₹1600.0)
INSERT INTO bookings (id, user_id, trip_id, booking_date, total_fare, amount_paid, amount_due, booking_type, status, payment_id)
VALUES 
(1, 2, 1, CURRENT_DATE, 1600.0, 1600.0, 0.0, 'FULL', 'CONFIRMED', 'pay_mock_112233')
ON CONFLICT (id) DO NOTHING;

INSERT INTO passengers (id, booking_id, name, age, gender, seat_number)
VALUES 
(1, 1, 'John Doe', 28, 'Male', 'L1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO passengers (id, booking_id, name, age, gender, seat_number)
VALUES 
(2, 1, 'Jane Doe', 25, 'Female', 'L2')
ON CONFLICT (id) DO NOTHING;

-- Booking 2: John Doe prebooked Trip 2 (Prebook payment: ₹198.0 paid, ₹1102.0 due)
INSERT INTO bookings (id, user_id, trip_id, booking_date, total_fare, amount_paid, amount_due, booking_type, status, payment_id)
VALUES 
(2, 2, 2, CURRENT_DATE, 1300.0, 198.0, 1102.0, 'PREBOOK', 'CONFIRMED', 'pay_mock_445566')
ON CONFLICT (id) DO NOTHING;

INSERT INTO passengers (id, booking_id, name, age, gender, seat_number)
VALUES 
(3, 2, 'Robert Smith', 45, 'Male', 'L1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO passengers (id, booking_id, name, age, gender, seat_number)
VALUES 
(4, 2, 'Alice Smith', 40, 'Female', 'L2')
ON CONFLICT (id) DO NOTHING;

-- Sync sequence values in PostgreSQL after manual inserts
SELECT setval('bookings_id_seq', COALESCE((SELECT MAX(id) FROM bookings), 0) + 1, false);
SELECT setval('passengers_id_seq', COALESCE((SELECT MAX(id) FROM passengers), 0) + 1, false);
SELECT setval('buses_id_seq', COALESCE((SELECT MAX(id) FROM buses), 0) + 1, false);
SELECT setval('routes_id_seq', COALESCE((SELECT MAX(id) FROM routes), 0) + 1, false);
SELECT setval('trips_id_seq', COALESCE((SELECT MAX(id) FROM trips), 0) + 1, false);
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);

-- Seed initial Feedbacks/Reviews
INSERT INTO feedbacks (id, name, email, rating, comment, created_at)
VALUES 
(1, 'Ramesh Kumar', 'ramesh@gmail.com', 5, 'Excellent service! The AC Sleeper seats were extremely clean and the staff was very cooperative.', NOW()),
(2, 'Priya Sharma', 'priya.sharma@yahoo.com', 4, 'Very comfortable journey from Mumbai to Pune. Bus arrived on time. Highly recommended.', NOW()),
(3, 'Vikram Singh', 'vikram.s@outlook.com', 5, 'Premium quality sleepers. The ticket booking experience was smooth and hassle-free.', NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('feedbacks_id_seq', COALESCE((SELECT MAX(id) FROM feedbacks), 0) + 1, false);

