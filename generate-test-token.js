import jwt from 'jsonwebtoken';

// Tạo token giả cho testing
const testToken = jwt.sign(
  { userId: '507f1f77bcf86cd799439011' }, // fake ObjectId
  'test-secret-key-123',
  { expiresIn: '7d' }
);

console.log('Test token:', testToken);

// Verify token
try {
  const decoded = jwt.verify(testToken, 'test-secret-key-123');
  console.log('Token decoded thành công:', decoded);
} catch (error) {
  console.log('Token verify thất bại:', error.message);
}
