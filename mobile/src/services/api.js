import axios from 'axios';
import { Platform } from 'react-native';

const DEFAULT_API_URL = Platform.select({
  android: 'http://10.0.2.2:5000',
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000'
});

export const api = axios.create({
  baseURL: DEFAULT_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

let currentToken = null;

export const setAuthToken = (token) => {
  currentToken = token;
  if (token) {
    api.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete api.defaults.headers.common['x-auth-token'];
  }
};

export const authService = {
  login: async (username, password) => {
    const res = await api.post('/users/login', { username, password });
    return res.data;
  },
  register: async (username, password) => {
    const res = await api.post('/users/register', { username, password });
    return res.data;
  }
};

export const taskService = {
  getTasks: async () => {
    const res = await api.get('/tasks');
    return res.data;
  },
  addTask: async (taskData) => {
    const res = await api.post('/tasks/add', taskData);
    return res.data;
  },
  updateTask: async (id, taskData) => {
    const res = await api.put(`/tasks/update/${id}`, taskData);
    return res.data;
  },
  deleteTask: async (id) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  }
};
