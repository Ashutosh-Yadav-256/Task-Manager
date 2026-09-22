const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../models/user.model');
const User = require('../models/user.model');
const app = require('../server');

describe('Users API Endpoints (/users)', () => {
  const originalEnv = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret_for_users_suite';
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /users/register', () => {
    it('should reject registration if username or password is missing', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({ username: 'testuser' });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Please enter all fields.');
    });

    it('should reject registration if password is less than 6 characters', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({ username: 'testuser', password: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Password must be at least 6 characters.');
    });

    it('should reject registration if user already exists', async () => {
      User.findOne.mockResolvedValue({ _id: 'existing_id', username: 'existinguser' });

      const res = await request(app)
        .post('/users/register')
        .send({ username: 'existinguser', password: 'password123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('An account with this username already exists.');
    });

    it('should register a new user successfully with hashed password', async () => {
      User.findOne.mockResolvedValue(null);

      const mockSavedUser = {
        _id: 'new_user_id',
        username: 'newuser',
        password: 'hashed_password'
      };

      User.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedUser)
      }));

      const res = await request(app)
        .post('/users/register')
        .send({ username: 'newuser', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('newuser');
    });
  });

  describe('POST /users/login', () => {
    it('should return 400 if user does not exist', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/users/login')
        .send({ username: 'unknownuser', password: 'password123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Invalid credentials.');
    });

    it('should return 400 if password does not match', async () => {
      const hashedPassword = await bcrypt.hash('correct_password', 10);
      User.findOne.mockResolvedValue({
        _id: 'user_123',
        username: 'testuser',
        password: hashedPassword
      });

      const res = await request(app)
        .post('/users/login')
        .send({ username: 'testuser', password: 'wrong_password' });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Invalid credentials.');
    });

    it('should authenticate user and return signed JWT token on valid credentials', async () => {
      const plainPassword = 'secure_password_123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      User.findOne.mockResolvedValue({
        _id: 'user_456',
        username: 'john_doe',
        password: hashedPassword
      });

      const res = await request(app)
        .post('/users/login')
        .send({ username: 'john_doe', password: plainPassword });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toEqual({
        id: 'user_456',
        username: 'john_doe'
      });

      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded.id).toBe('user_456');
    });
  });
});
