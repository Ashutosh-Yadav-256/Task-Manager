const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

describe('Auth Middleware Unit Tests', () => {
  const originalEnv = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalEnv;
  });

  it('should return 401 if x-auth-token header is missing', () => {
    const req = {
      header: jest.fn().mockReturnValue(null)
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    auth(req, res, next);

    expect(req.header).toHaveBeenCalledWith('x-auth-token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'No authentication token, authorization denied.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should populate req.user and call next() with valid token', () => {
    const userId = 'user_abc_123';
    const validToken = jwt.sign({ id: userId }, process.env.JWT_SECRET);

    const req = {
      header: jest.fn().mockReturnValue(validToken)
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    auth(req, res, next);

    expect(req.header).toHaveBeenCalledWith('x-auth-token');
    expect(req.user).toBe(userId);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 500 when jwt verification throws an error', () => {
    const req = {
      header: jest.fn().mockReturnValue('invalid-corrupted-token')
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    expect(next).not.toHaveBeenCalled();
  });
});
