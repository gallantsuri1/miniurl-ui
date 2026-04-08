export const ADMIN_USER = {
  username: process.env.E2E_ADMIN_USERNAME || '',
  password: process.env.E2E_ADMIN_PASSWORD || '',
  role: 'ADMIN',
};

export const REGULAR_USER = {
  username: process.env.E2E_USER_USERNAME || '',
  password: process.env.E2E_USER_PASSWORD || '',
  role: 'USER',
};

export const API_URL = process.env.VITE_API_URL || 'http://localhost:8080';
