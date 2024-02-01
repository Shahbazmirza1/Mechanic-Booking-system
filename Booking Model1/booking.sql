CREATE DATABASE mechanic;

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE mechanics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_name VARCHAR(255) ,
    car_brand VARCHAR(255) ,
    plate_number VARCHAR(255) ,
    appointment_date DATETIME ,
    notes TEXT
);
ALTER TABLE appointments
ADD COLUMN mechanic_id INT;

CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    car_model VARCHAR(255),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS mechanic (
    mechanic_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    availability BOOLEAN DEFAULT TRUE
);
CREATE TABLE services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    service_availability BOOLEAN NOT NULL
);


ALTER TABLE appointments
ADD COLUMN customer_id INT,
ADD FOREIGN KEY (customer_id) REFERENCES customers(id);
drop table appointments;

ALTER TABLE appointments
ADD COLUMN status VARCHAR(255) DEFAULT 'Pending';
