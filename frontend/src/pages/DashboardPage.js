import React, { useState, useEffect, useContext } from 'react';
import { Box, Grid, Fab, Tooltip } from '@mui/material';
import axios from 'axios';
import { DragDropContext } from 'react-beautiful-dnd';
import { AuthContext } from '../context/AuthContext';
import Column from '../components/Column';
import TaskModal from '../components/TaskModal';
import AddIcon from '@mui/icons-material/Add';

const DashboardPage = () => {
    const [tasks, setTasks] = useState([]);
    const { token } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await axios.get('http://localhost:5000/tasks', {
                    headers: { 'x-auth-token': token }
                });
                setTasks(res.data);
            } catch (err) {
                console.error('Error fetching tasks:', err);
            }
        };

        if (token) {
            fetchTasks();
        }
    }, [token]);

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const task = tasks.find(t => t._id === draggableId);
        const newStatus = destination.droppableId;

        const updatedTasks = tasks.map(t =>
            t._id === draggableId ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);

        try {
            await axios.put(`http://localhost:5000/tasks/update/${draggableId}`,
                { ...task, status: newStatus },
                { headers: { 'x-auth-token': token } }
            );
        } catch (err) {
            console.error('Failed to update task status:', err);
            setTasks(tasks);
        }
    };

    const openModalForNew = () => { setEditingTask(null); setIsModalOpen(true); };
    const openModalForEdit = (task) => { setEditingTask(task); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingTask(null); };

    const handleSaveTask = async (taskData) => {
        if (taskData._id) {
            try {
                const res = await axios.put(`http://localhost:5000/tasks/update/${taskData._id}`, taskData, {
                    headers: { 'x-auth-token': token }
                });
                setTasks(tasks.map(t => t._id === taskData._id ? res.data : t));
            } catch (err) { console.error('Error updating task:', err); }
        } else {
            try {
                const res = await axios.post('http://localhost:5000/tasks/add', taskData, {
                    headers: { 'x-auth-token': token }
                });
                setTasks([...tasks, res.data]);
            } catch (err) { console.error('Error adding task:', err); }
        }
        closeModal();
    };

    const todoTasks = tasks.filter(task => task.status === 'To-Do');
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
    const doneTasks = tasks.filter(task => task.status === 'Done');

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <Box sx={{ p: 4, height: 'calc(100vh - 64px)', overflowX: 'auto' }}>
                    <Grid container spacing={3} justifyContent="center" flexWrap="nowrap">
                        <Grid item><Column title="To-Do" tasks={todoTasks} onEdit={openModalForEdit}/></Grid>
                        <Grid item><Column title="In Progress" tasks={inProgressTasks} onEdit={openModalForEdit}/></Grid>
                        <Grid item><Column title="Done" tasks={doneTasks} onEdit={openModalForEdit}/></Grid>
                    </Grid>
                </Box>
            </DragDropContext>
            <Tooltip title="Add New Task">
                <Fab color="primary" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={openModalForNew}>
                    <AddIcon />
                </Fab>
            </Tooltip>
            <TaskModal open={isModalOpen} handleClose={closeModal} handleSave={handleSaveTask} task={editingTask} />
        </>
    );
};

export default DashboardPage;
