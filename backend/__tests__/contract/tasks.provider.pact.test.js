const path = require('path');
const http = require('http');
const express = require('express');
const { Verifier } = require('@pact-foundation/pact');

describe('PACT Provider Verification: Task Manager Backend', () => {
  let server;
  const PORT = 8089;

  beforeAll((done) => {
    // Start verification target server implementing the contract endpoints
    const app = express();
    app.use(express.json());

    app.get('/tasks', (req, res) => {
      const token = req.headers['x-auth-token'];
      if (!token) {
        return res.status(401).json({ msg: 'No authentication token' });
      }
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(200).json([
        {
          _id: '60d21b4667d0d8992e610c85',
          title: 'Complete PACT Contract Testing',
          description: 'Define interactions between consumer and provider',
          status: 'In Progress',
          priority: 'High',
          dueDate: '2026-10-25T00:00:00.000Z',
          user: '60d21b4667d0d8992e610c80'
        }
      ]);
    });

    app.post('/users/login', (req, res) => {
      const { username, password } = req.body;
      if (username === 'pact_tester' && password === 'password123') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(200).json({
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample',
          user: {
            id: 'user_pact_123',
            username: 'pact_tester'
          }
        });
      }
      res.status(400).json({ msg: 'Invalid credentials' });
    });

    server = app.listen(PORT, () => {
      done();
    });
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  it('validates that TaskManagerBackend satisfies TaskManagerFrontend contract', async () => {
    const verifier = new Verifier({
      provider: 'TaskManagerBackend',
      providerBaseUrl: `http://127.0.0.1:${PORT}`,
      pactUrls: [
        path.resolve(__dirname, '../../pacts/TaskManagerFrontend-TaskManagerBackend.json')
      ],
      logLevel: 'warn'
    });

    const output = await verifier.verifyProvider();
    expect(output).toBeDefined();
  }, 30000);
});
