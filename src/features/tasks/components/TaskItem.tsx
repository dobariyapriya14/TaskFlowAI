import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../services/TaskService';

interface TaskItemProps {
  item: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskItem = React.memo<TaskItemProps>(
  ({ item, onEdit, onDelete }) => {
    return (
      <View style={styles.taskItem}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskSub}>
            {item.category || 'No Category'} - {item.priority || 'Normal'}
          </Text>
        </View>
        <View style={styles.taskActions}>
          <TouchableOpacity
            onPress={() => onEdit(item)}
            style={styles.iconButton}
          >
            <Text style={styles.iconText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => item.id && onDelete(item.id)}
            style={styles.iconButton}
          >
            <Text style={styles.iconText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

TaskItem.displayName = 'TaskItem';

const styles = StyleSheet.create({
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
});
