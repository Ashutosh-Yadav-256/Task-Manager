const path = require('path');
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const axios = require('axios');

const { like, eachLike } = MatchersV3;

const provider = new PactV3({
  consumer: 'TaskManagerFrontend',
  provider: 'TaskManagerBackend',
  dir: path.resolve(__dirname, '../../pacts'),
  logLevel: 'warn'
});

describe('PACT Consumer Contract Testing: Task Manager API', () => {
  describe('GET /tasks endpoint', () => {
    it('returns a list of tasks for authenticated user', () => {
      provider
        .uponReceiving('a request for all user tasks')
        .withRequest({
          method: 'GET',
          path: '/tasks',
          headers: {
            'x-auth-token': 'valid-pact-jwt-token'
          }
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: eachLike({
            _id: like('60d21b4667d0d8992e610c85'),
            title: like('Complete PACT Contract Testing'),
            description: like('Define interactions between consumer and provider'),
            status: like('In Progress'),
            priority: like('High'),
            dueDate: like('2026-10-25T00:00:00.000Z'),
            user: like('60d21b4667d0d8992e610c80')
          })
        });

      return provider.executeTest(async (mockserver) => {
        const response = await axios.get(`${mockserver.url}/tasks`, {
          headers: {
            'x-auth-token': 'valid-pact-jwt-token'
          }
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveLength(1);
        expect(response.data[0].title).toBe('Complete PACT Contract Testing');
      });
    });
  });

  describe('POST /users/login endpoint', () => {
    it('authenticates user and returns JWT session token', () => {
      provider
        .uponReceiving('a valid login request')
        .withRequest({
          method: 'POST',
          path: '/users/login',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            username: 'pact_tester',
            password: 'password123'
          }
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            token: like('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample'),
            user: {
              id: like('user_pact_123'),
              username: like('pact_tester')
            }
          }
        });

      return provider.executeTest(async (mockserver) => {
        const response = await axios.post(`${mockserver.url}/users/login`, {
          username: 'pact_tester',
          password: 'password123'
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('token');
        expect(response.data.user.username).toBe('pact_tester');
      });
    });
  });
});
