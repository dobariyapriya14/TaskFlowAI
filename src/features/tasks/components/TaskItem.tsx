import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../services/TaskService';

interface TaskItemProps {
  item: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleCompleted?: (task: Task) => void;
}

export const TaskItem = React.memo<TaskItemProps>(
  ({ item, onEdit, onDelete, onToggleCompleted }) => {
    const taskId = item.id || 'temp';
    return (
      <View style={styles.taskItem} testID={`task-item-${taskId}`}>
        {onToggleCompleted && (
          <TouchableOpacity
            testID={`task-toggle-${taskId}`}
            onPress={() => onToggleCompleted(item)}
            style={styles.checkboxContainer}
          >
            <View
              style={[
                styles.checkbox,
                item.completed && styles.checkboxChecked,
              ]}
            >
              {item.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.taskInfo}>
          <Text
            style={[
              styles.taskTitle,
              item.completed && styles.taskTitleCompleted,
            ]}
            testID={`task-title-${taskId}`}
          >
            {item.title}
          </Text>
          <Text style={styles.taskSub}>
            {item.category || 'No Category'} - {item.priority || 'Normal'}
          </Text>
        </View>
        <View style={styles.taskActions}>
          <TouchableOpacity
            testID={`task-edit-button-${taskId}`}
            onPress={() => onEdit(item)}
            style={styles.iconButton}
          >
            <Text style={styles.iconText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID={`task-delete-button-${taskId}`}
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
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ADB5BD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
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
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
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
