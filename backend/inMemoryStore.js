const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'taskflow_enterprise_jwt_secret_2026';

let demoTasks = [
  {
    _id: 'task_001',
    title: 'Release React Native Mobile App (APK)',
    description: 'Standalone Android APK compiled with Gradle 8.3 and published to GitHub Releases.',
    status: 'Done',
    priority: 'High',
    dueDate: '2026-09-22T00:00:00.000Z',
    user: 'demo_user_id'
  },
  {
    _id: 'task_002',
    title: 'PACT Consumer & Provider Contracts',
    description: 'V3 consumer-driven contract testing between React frontend and Express backend.',
    status: 'Done',
    priority: 'High',
    dueDate: '2026-09-23T00:00:00.000Z',
    user: 'demo_user_id'
  },
  {
    _id: 'task_003',
    title: 'Angular 17+ Enterprise Client',
    description: 'Standalone component architecture with RxJS reactive state and auth guards.',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: '2026-09-25T00:00:00.000Z',
    user: 'demo_user_id'
  },
  {
    _id: 'task_004',
    title: 'Multi-Stage Jenkins CI/CD Pipeline',
    description: 'Automate lint, test, contract verification, docker build and artifact packaging.',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-09-28T00:00:00.000Z',
    user: 'demo_user_id'
  },
  {
    _id: 'task_005',
    title: 'GitLab CI Integration & Test Matrix',
    description: 'Configure 4-stage pipeline with shared caching and test report archiving.',
    status: 'To-Do',
    priority: 'Medium',
    dueDate: '2026-10-01T00:00:00.000Z',
    user: 'demo_user_id'
  },
  {
    _id: 'task_006',
    title: 'E2E Testing & Performance Benchmarking',
    description: 'Run automated end-to-end user journeys and measure API response latencies.',
    status: 'To-Do',
    priority: 'Low',
    dueDate: '2026-10-05T00:00:00.000Z',
    user: 'demo_user_id'
  }
];

const mockUsers = [
  { _id: 'demo_user_id', username: 'demo', password: 'password123' }
];

function inMemoryAuth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No authentication token, authorization denied' });
  }
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified.id;
    next();
  } catch (err) {
    req.user = 'demo_user_id';
    next();
  }
}

const memoryRouter = express.Router();

// User routes
memoryRouter.post('/users/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ msg: 'Please enter all fields.' });
  }
  const newUser = { _id: 'user_' + Date.now(), username, password };
  mockUsers.push(newUser);
  res.json(newUser);
});

memoryRouter.post('/users/login', (req, res) => {
  const { username, password } = req.body;
  const token = jwt.sign({ id: 'demo_user_id', username: username || 'demo' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({
    token,
    user: { id: 'demo_user_id', username: username || 'demo' }
  });
});

// Tasks routes
memoryRouter.get('/tasks', inMemoryAuth, (req, res) => {
  res.json(demoTasks);
});

memoryRouter.post('/tasks/add', inMemoryAuth, (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;
  const newTask = {
    _id: 'task_' + Date.now(),
    title,
    description,
    status: status || 'To-Do',
    priority: priority || 'Medium',
    dueDate: dueDate || new Date().toISOString(),
    user: req.user || 'demo_user_id'
  };
  demoTasks.push(newTask);
  res.json(newTask);
});

memoryRouter.put('/tasks/update/:id', inMemoryAuth, (req, res) => {
  const id = req.params.id;
  const index = demoTasks.findIndex(t => t._id === id);
  if (index === -1) {
    return res.status(404).json({ msg: 'Task not found.' });
  }
  demoTasks[index] = { ...demoTasks[index], ...req.body };
  res.json(demoTasks[index]);
});

memoryRouter.delete('/tasks/:id', inMemoryAuth, (req, res) => {
  const id = req.params.id;
  const index = demoTasks.findIndex(t => t._id === id);
  if (index === -1) {
    return res.status(404).json({ msg: 'Task not found.' });
  }
  const deleted = demoTasks.splice(index, 1)[0];
  res.json(deleted);
});

module.exports = { memoryRouter, JWT_SECRET };
