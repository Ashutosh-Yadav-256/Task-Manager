import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';

const STATUS_OPTIONS = ['To-Do', 'In Progress', 'Done'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

export default function TaskModal({ visible, task, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To-Do');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'To-Do');
      setPriority(task.priority || 'Medium');
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('To-Do');
      setPriority('Medium');
      setDueDate('');
    }
    setError('');
  }, [task, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate.trim() || undefined
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{task ? 'Edit Task' : 'New Task'}</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <ScrollView style={styles.scroll}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Contract Testing with Pact"
              placeholderTextColor="#64748b"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Task details and deliverables"
              placeholderTextColor="#64748b"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Status</Text>
            <View style={styles.pillRow}>
              {STATUS_OPTIONS.map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.pill, status === st && styles.pillActive]}
                  onPress={() => setStatus(st)}
                >
                  <Text style={[styles.pillText, status === st && styles.pillTextActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.pillRow}>
              {PRIORITY_OPTIONS.map((pr) => (
                <TouchableOpacity
                  key={pr}
                  style={[
                    styles.pill,
                    priority === pr && (
                      pr === 'High' ? styles.pillHigh :
                      pr === 'Medium' ? styles.pillMedium : styles.pillLow
                    )
                  ]}
                  onPress={() => setPriority(pr)}
                >
                  <Text style={[styles.pillText, priority === pr && styles.pillTextActive]}>
                    {pr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2026-10-31"
              placeholderTextColor="#64748b"
              value={dueDate}
              onChangeText={setDueDate}
            />
          </ScrollView>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{task ? 'Update' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%'
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 16
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
    fontSize: 13
  },
  scroll: {
    marginBottom: 16
  },
  label: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    padding: 12,
    fontSize: 14
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  pillActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6'
  },
  pillHigh: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444'
  },
  pillMedium: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b'
  },
  pillLow: {
    backgroundColor: '#10b981',
    borderColor: '#10b981'
  },
  pillText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600'
  },
  pillTextActive: {
    color: '#ffffff'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#334155',
    alignItems: 'center'
  },
  cancelBtnText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 15
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    alignItems: 'center'
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15
  }
});
