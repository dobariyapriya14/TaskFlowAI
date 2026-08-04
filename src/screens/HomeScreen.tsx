import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/authService';
import { logMessage } from '../services/crashlytics';
import { taskService, Task } from '../services/taskService';
import { handleError } from '../utils/errorHandler';

export const HomeScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Normal');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { tasks: fetchedTasks } = await taskService.queryTasks();
      setTasks(fetchedTasks);
    } catch (error: any) {
      handleError(error, 'HomeScreen: loadTasks', true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    logMessage('User opened Home Screen');
    loadTasks();
  }, [loadTasks]);

  const handleSaveTask = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return;
    }

    setLoading(true);
    try {
      if (editingTaskId) {
        await taskService.updateTask(editingTaskId, {
          title,
          category,
          priority,
        });
      } else {
        await taskService.addTask({
          title,
          category,
          priority,
          completed: false,
        });
      }
      setModalVisible(false);
      resetForm();
      loadTasks();
    } catch (error: any) {
      handleError(error, 'HomeScreen: handleSaveTask', true);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id || null);
    setTitle(task.title);
    setCategory(task.category || '');
    setPriority(task.priority || 'Normal');
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingTaskId(null);
    setTitle('');
    setCategory('');
    setPriority('Normal');
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleDeleteTask = async (id: string) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await taskService.deleteTask(id);
            loadTasks();
          } catch (e: any) {
            handleError(e, 'HomeScreen: handleDeleteTask', true);
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      handleError(error, 'HomeScreen: handleLogout', true);
    }
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskSub}>
          {item.category || 'No Category'} - {item.priority || 'Normal'}
        </Text>
      </View>
      <View style={styles.taskActions}>
        <TouchableOpacity
          onPress={() => handleEditClick(item)}
          style={styles.iconButton}
        >
          <Text style={styles.iconText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => item.id && handleDeleteTask(item.id)}
          style={styles.iconButton}
        >
          <Text style={styles.iconText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTasks} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks found. Add one!</Text>
        }
      />

      <View style={styles.fabContainer}>
        <Button title="+ Add Task" onPress={openAddModal} />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTaskId ? 'Edit Task' : 'Add Task'}
            </Text>

            <Input
              label="Title"
              placeholder="Task Title"
              value={title}
              onChangeText={setTitle}
            />
            <Input
              label="Category"
              placeholder="e.g. Work, Personal"
              value={category}
              onChangeText={setCategory}
            />
            <Input
              label="Priority"
              placeholder="e.g. High, Normal, Low"
              value={priority}
              onChangeText={setPriority}
            />

            <View style={styles.modalButtons}>
              <View style={styles.modalButton}>
                <Button title="Cancel" onPress={() => setModalVisible(false)} />
              </View>
              <View style={styles.modalButton}>
                <Button
                  title="Save"
                  onPress={handleSaveTask}
                  loading={loading}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  taskItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskSub: {
    fontSize: 12,
    color: '#666',
  },
  taskActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 5,
  },
  iconText: {
    fontSize: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
  },
  fabContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});
