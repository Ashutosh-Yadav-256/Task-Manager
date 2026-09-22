const router = require('express').Router();
const auth = require('../middleware/auth');
let Task = require('../models/task.model');

router.get('/', auth, async (req, res) => {
    const tasks = await Task.find({ user: req.user });
    res.json(tasks);
});

router.post('/add', auth, async (req, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body;
        const newTask = new Task({
            title,
            description,
            status: status || 'To-Do',
            priority,
            dueDate,
            user: req.user,
        });

        const savedTask = await newTask.save();
        res.json(savedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/update/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user });
        if (!task) {
            return res.status(404).json({ msg: "Task not found." });
        }

        const { title, description, status, priority, dueDate } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, {
            title, description, status, priority, dueDate
        }, { new: true });

        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user });
        if (!task) {
            return res.status(404).json({ msg: "Task not found." });
        }
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        res.json(deletedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
