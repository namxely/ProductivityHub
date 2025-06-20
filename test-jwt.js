import jwt from 'jsonwebtoken';

const secret1 = 'your-secret-key';
const secret2 = 'your-super-secret-jwt-key-change-this-in-production';

// Test token với secret1
const token1 = jwt.sign({ userId: 'test' }, secret1, { expiresIn: '7d' });
console.log('Token với secret1:', token1);

try {
  const decoded1 = jwt.verify(token1, secret1);
  console.log('Verify với secret1 thành công:', decoded1);
} catch (error) {
  console.log('Verify với secret1 thất bại:', error.message);
}

try {
  const decoded2 = jwt.verify(token1, secret2);
  console.log('Verify với secret2 thành công:', decoded2);
} catch (error) {
  console.log('Verify với secret2 thất bại:', error.message);
}

// Test token thực
const actualToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nzg4OGEzYTI5YjYyMTBkNDNhMjliIiwiaWF0IjoxNzM3MTA3Mzg2LCJleHAiOjE3Mzc3MTIxODZ9.bLqcwcpEKoZb8pLs3DY2M30hjack_AsNncMFe1fqd8A';

try {
  const decoded = jwt.verify(actualToken, secret1);
  console.log('Token thực verify với secret1:', decoded);
} catch (error) {
  console.log('Token thực verify với secret1 thất bại:', error.message);
}

try {
  const decoded = jwt.verify(actualToken, secret2);
  console.log('Token thực verify với secret2:', decoded);
} catch (error) {
  console.log('Token thực verify với secret2 thất bại:', error.message);
}
