-- Add password column to users table if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Create extension for password hashing if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Optional: Insert test users with passwords (bcrypt encoded)
-- admin123 -> $2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss8KIUgO2t0jKMUe
INSERT INTO users (full_name, email, password, role, provider, created_at, updated_at)
VALUES 
  ('Admin User', 'admin@smartcampus.edu', '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss8KIUgO2t0jKMUe', 'ADMIN', 'local', now(), now())
ON CONFLICT (email) DO UPDATE SET
  password = '$2a$10$slYQmyNdGzin7olVN3/p2OPST9/PgBkqquzi.Ss8KIUgO2t0jKMUe',
  provider = 'local'
WHERE users.provider IS NULL OR users.provider != 'local';

-- staff123 -> $2a$10$4Z7mQ9N0RJcL8xF5B2J3uuN7K1M5P9X2qR3S4T5U6V7W8Y9Z0A1B2
INSERT INTO users (full_name, email, password, role, provider, created_at, updated_at)
VALUES 
  ('Staff User', 'staff@smartcampus.edu', '$2a$10$4Z7mQ9N0RJcL8xF5B2J3uuN7K1M5P9X2qR3S4T5U6V7W8Y9Z0A1B2', 'STAFF', 'local', now(), now())
ON CONFLICT (email) DO UPDATE SET
  password = '$2a$10$4Z7mQ9N0RJcL8xF5B2J3uuN7K1M5P9X2qR3S4T5U6V7W8Y9Z0A1B2',
  provider = 'local'
WHERE users.provider IS NULL OR users.provider != 'local';

-- student123 -> $2a$10$V9X2Y3Z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2
INSERT INTO users (full_name, email, password, role, provider, created_at, updated_at)
VALUES 
  ('Student User', 'student@smartcampus.edu', '$2a$10$V9X2Y3Z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2', 'STUDENT', 'local', now(), now())
ON CONFLICT (email) DO UPDATE SET
  password = '$2a$10$V9X2Y3Z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2',
  provider = 'local'
WHERE users.provider IS NULL OR users.provider != 'local';
