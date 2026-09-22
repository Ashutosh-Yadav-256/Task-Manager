const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/task.model');
const Task = require('../models/task.model');
const app = require('../server');

describe('Tasks API Endpoints (/tasks)', () => {
  const JWT_SECRET = 'test_secret_for_tasks_suite';
  const testUserId = 'user_999';
  let validToken;

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    validToken = jwt.sign({ id: testUserId }, JWT_SECRET);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /tasks', () => {
    it('should reject request without authentication token', async () => {
      const res = await request(app).get('/tasks');
      expect(res.statusCode).toBe(401);
    });

    it('should return all tasks belonging to authenticated user', async () => {
      const mockTasks = [
        { _id: 'task_1', title: 'Implement Jest Tests', status: 'In Progress', user: testUserId },
        { _id: 'task_2', title: 'Build React Native App', status: 'To-Do', user: testUserId }
      ];
      Task.find.mockResolvedValue(mockTasks);

      const res = await request(app)
        .get('/tasks')
        .set('x-auth-token', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(Task.find).toHaveBeenCalledWith({ user: testUserId });
    });
  });

  describe('POST /tasks/add', () => {
    it('should create and save a new task', async () => {
      const newTaskData = {
        title: 'Complete Contract Testing',
        description: 'Verify Pact specifications between client and API',
        status: 'To-Do',
        priority: 'High',
        dueDate: '2026-10-01'
      };

      const mockSavedTask = {
        _id: 'task_3',
        ...newTaskData,
        user: testUserId
      };

      Task.mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue(mockSavedTask)
      }));

      const res = await request(app)
        .post('/tasks/add')
        .set('x-auth-token', validToken)
        .send(newTaskData);

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Complete Contract Testing');
      expect(res.body.user).toBe(testUserId);
    });
  });

  describe('PUT /tasks/update/:id', () => {
    it('should return 404 if task is not found or does not belong to user', async () => {
      Task.findOne.mockResolvedValue(null);

      const res = await request(app)
        .put('/tasks/update/task_non_existent')
        .set('x-auth-token', validToken)
        .send({ title: 'Updated Title' });

      expect(res.statusCode).toBe(404);
      expect(res.body.msg).toBe('Task not found.');
    });

    it('should update task when user is authorized owner', async () => {
      Task.findOne.mockResolvedValue({ _id: 'task_1', user: testUserId });
      const updatedMock = {
        _id: 'task_1',
        title: 'Updated Title',
        status: 'Done',
        user: testUserId
      };
      Task.findByIdAndUpdate.mockResolvedValue(updatedMock);

      const res = await request(app)
        .put('/tasks/update/task_1')
        .set('x-auth-token', validToken)
        .send({ title: 'Updated Title', status: 'Done' });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Title');
      expect(res.body.status).toBe('Done');
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should return 404 when deleting non-existent task', async () => {
      Task.findOne.mockResolvedValue(null);

      const res = await request(app)
        .delete('/tasks/task_missing')
        .set('x-auth-token', validToken);

      expect(res.statusCode).toBe(404);
      expect(res.body.msg).toBe('Task not found.');
    });

    it('should delete task and return deleted document', async () => {
      const existingTask = { _id: 'task_to_del', user: testUserId };
      Task.findOne.mockResolvedValue(existingTask);
      Task.findByIdAndDelete.mockResolvedValue(existingTask);

      const res = await request(app)
        .delete('/tasks/task_to_del')
        .set('x-auth-token', validToken);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe('task_to_del');
      expect(Task.findByIdAndDelete).toHaveBeenCalledWith('task_to_del');
    });
  });
});
