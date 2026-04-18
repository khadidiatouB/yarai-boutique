-- Migration : ajout table Admin
CREATE TABLE IF NOT EXISTS "Admin" (
  "id"        SERIAL PRIMARY KEY,
  "email"     TEXT NOT NULL UNIQUE,
  "password"  TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
