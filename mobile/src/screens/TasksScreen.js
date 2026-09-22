import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { taskService } from '../services/api';
import TaskModal from '../components/TaskModal';

const TABS = ['All', 'To-Do', 'In Progress', 'Done'];

export default function TasksScreen() {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load tasks from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (selectedTask) {
        const updated = await taskService.updateTask(selectedTask._id, taskData);
        setTasks((prev) => prev.map((t) => (t._id === selectedTask._id ? updated : t)));
      } else {
        const created = await taskService.addTask(taskData);
        setTasks((prev) => [created, ...prev]);
      }
      setModalVisible(false);
      setSelectedTask(null);
    } catch (err) {
      Alert.alert('Save Error', err.response?.data?.error || err.message);
    }
  };

  const handleDeleteTask = (id) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await taskService.deleteTask(id);
            setTasks((prev) => prev.filter((t) => t._id !== id));
          } catch (err) {
            Alert.alert('Delete Error', 'Failed to delete task.');
          }
        }
      }
    ]);
  };

  const cycleStatus = async (task) => {
    const nextStatus =
      task.status === 'To-Do'
        ? 'In Progress'
        : task.status === 'In Progress'
        ? 'Done'
        : 'To-Do';

    try {
      const updated = await taskService.updateTask(task._id, {
        ...task,
        status: nextStatus
      });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
    } catch (err) {
      Alert.alert('Error', 'Could not update task status');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'All') return true;
    return t.status === activeTab;
  });

  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'High':
        return styles.badgeHigh;
      case 'Medium':
        return styles.badgeMedium;
      case 'Low':
        return styles.badgeLow;
      default:
        return styles.badgeMedium;
    }
  };

  const renderTaskItem = ({ item }) => (
    <View style={styles.taskCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <View style={[styles.badge, getPriorityBadgeStyle(item.priority)]}>
          <Text style={styles.badgeText}>{item.priority}</Text>
        </View>
      </View>

      {item.description ? (
        <Text style={styles.taskDesc}>{item.description}</Text>
      ) : null}

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={[styles.statusBtn, item.status === 'Done' && styles.statusBtnDone]}
          onPress={() => cycleStatus(item)}
        >
          <Text style={styles.statusBtnText}>{item.status} -&gt;</Text>
        </TouchableOpacity>

        <View style={styles.actionBtns}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              setSelectedTask(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.iconBtnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, styles.deleteBtn]}
            onPress={() => handleDeleteTask(item._id)}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>TaskFlow</Text>
          <Text style={styles.headerUser}>Signed in as {user?.username || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item._id}
          renderItem={renderTaskItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks found in {activeTab}</Text>
              <Text style={styles.emptySubtext}>Tap the '+' button below to create one.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setSelectedTask(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <TaskModal
        visible={modalVisible}
        task={selectedTask}
        onClose={() => {
          setModalVisible(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc'
  },
  headerUser: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#334155'
  },
  logoutText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600'
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    alignItems: 'center'
  },
  tabActive: {
    backgroundColor: '#3b82f6'
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  tabTextActive: {
    color: '#ffffff'
  },
  listContent: {
    padding: 16,
    paddingBottom: 90
  },
  taskCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
    marginRight: 8
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  badgeHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)'
  },
  badgeMedium: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)'
  },
  badgeLow: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)'
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f8fafc'
  },
  taskDesc: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155'
  },
  statusBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569'
  },
  statusBtnDone: {
    borderColor: '#10b981'
  },
  statusBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600'
  },
  actionBtns: {
    flexDirection: 'row',
    gap: 8
  },
  iconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#334155'
  },
  iconBtnText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600'
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)'
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600'
  },
  emptySubtext: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 6
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8
  },
  fabText: {
    color: '#ffffff',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '300'
  }
});
