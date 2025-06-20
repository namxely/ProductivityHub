@echo off
set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
set NODE_ENV=development
set PORT=5000
node server/index.js
