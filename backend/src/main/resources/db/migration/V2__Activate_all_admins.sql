-- Set all admins as active
UPDATE users SET active = true WHERE role = 'ADMIN';
