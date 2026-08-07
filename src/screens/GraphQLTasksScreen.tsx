import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
  useGraphQLTasks,
  useGraphQLAIInsights,
  useGraphQLTaskMutations,
  latestNativeHeaders,
  GraphQLTask,
} from '../graphql';
import {
  GraphQLNativeBridge,
  NativeGraphQLHeaders,
} from '../graphql/native/GraphQLNativeBridge';

export const GraphQLTasksScreen: React.FC<{ navigation?: any }> = ({
  navigation,
}) => {
  const [editingTask, setEditingTask] = useState<GraphQLTask | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<
    'Low' | 'Normal' | 'High' | 'Urgent'
  >('Normal');
  const [nativeHeaders, setNativeHeaders] =
    useState<NativeGraphQLHeaders | null>(latestNativeHeaders);
  const [cachedPayload, setCachedPayload] = useState<string | null>(null);

  // GraphQL Reusable Hooks & Service Layer
  const { tasks, loading, error, refetch } = useGraphQLTasks();
  const { aiInsights: ai, refetch: refetchAI } = useGraphQLAIInsights();
  const {
    createTask,
    updateTask,
    toggleTaskCompleted,
    deleteTask,
    creating,
    updating,
  } = useGraphQLTaskMutations();

  // Load Native Headers & Native Module Cache
  const loadNativeModuleData = useCallback(async () => {
    try {
      const headers = await GraphQLNativeBridge.getNativeHeaders();
      setNativeHeaders(headers);

      // Store response key in Native Cache
      await GraphQLNativeBridge.cacheGraphQLResponse(
        'last_sync',
        new Date().toISOString(),
      );
      const cached = await GraphQLNativeBridge.getCachedGraphQLResponse(
        'last_sync',
      );
      setCachedPayload(cached);
    } catch (e) {
      console.warn('Native Bridge Error:', e);
    }
  }, []);

  useEffect(() => {
    loadNativeModuleData();
  }, [loadNativeModuleData]);

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setCategory('');
    setPriority('Normal');
    setModalVisible(true);
  };

  const openEditModal = (task: GraphQLTask) => {
    setEditingTask(task);
    setTitle(task.title);
    setCategory(task.category || '');
    setPriority(task.priority || 'Normal');
    setModalVisible(true);
  };

  const handleSaveTask = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Task title is required');
      return;
    }

    try {
      if (editingTask) {
        await updateTask(editingTask.id, {
          title: title.trim(),
          category: category.trim() || 'GraphQL',
          priority,
          completed: editingTask.completed,
        });
      } else {
        await createTask(
          {
            title: title.trim(),
            category: category.trim() || 'GraphQL',
            priority,
            completed: false,
          },
          { optimistic: true },
        );
      }

      setTitle('');
      setCategory('');
      setPriority('Normal');
      setEditingTask(null);
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('GraphQL Error', err.message || 'Failed to save task');
    }
  };

  const handleToggle = async (task: GraphQLTask) => {
    try {
      await toggleTaskCompleted(task);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to toggle task status');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this GraphQL task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(id);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete task');
            }
          },
        },
      ],
    );
  };

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchAI(), loadNativeModuleData()]);
  };

  const getPriorityBadgeStyle = (taskPriority?: string) => {
    switch (taskPriority) {
      case 'Urgent':
      case 'High':
        return styles.priorityHigh;
      case 'Low':
        return styles.priorityLow;
      case 'Normal':
      default:
        return styles.priorityNormal;
    }
  };

  const getPriorityTextStyle = (taskPriority?: string) => {
    switch (taskPriority) {
      case 'Urgent':
      case 'High':
        return styles.priorityTextHigh;
      case 'Low':
        return styles.priorityTextLow;
      case 'Normal':
      default:
        return styles.priorityTextNormal;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} testID="graphql-tasks-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          testID="back-button"
          onPress={() => navigation?.goBack?.()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GraphQL Tasks</Text>
        <TouchableOpacity testID="refresh-button" onPress={handleRefresh}>
          <Text style={styles.refreshText}>Sync</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        {/* Native Module Header Card */}
        <View style={styles.nativeCard} testID="native-header-card">
          <Text style={styles.nativeCardTitle}>⚡ Native Module Telemetry</Text>
          <Text style={styles.nativeText}>
            Platform:{' '}
            <Text style={styles.nativeVal}>
              {nativeHeaders?.['X-Native-Platform'] || 'Detecting...'}
            </Text>
          </Text>
          <Text style={styles.nativeText}>
            Security Token:{' '}
            <Text style={styles.nativeVal}>
              {nativeHeaders?.['X-Native-Security-Token']?.slice(0, 22) ||
                'N/A'}
              ...
            </Text>
          </Text>
          <Text style={styles.nativeText}>
            Native Cache Sync:{' '}
            <Text style={styles.nativeVal}>
              {cachedPayload
                ? new Date(cachedPayload).toLocaleTimeString()
                : 'Syncing...'}
            </Text>
          </Text>
        </View>

        {/* AI Insight Card */}
        {ai && (
          <View style={styles.aiCard} testID="ai-insight-card">
            <View style={styles.aiHeaderRow}>
              <Text style={styles.aiTitle}>🤖 AI Productivity Insights</Text>
              <Text style={styles.aiScore}>{ai.productivityScore}%</Text>
            </View>
            <Text style={styles.aiSummary}>{ai.summary}</Text>
          </View>
        )}

        {/* Task List Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Apollo Managed Tasks ({tasks.length})
          </Text>
        </View>

        {loading && tasks.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Fetching GraphQL Data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>GraphQL Error: {error.message}</Text>
            <Button title="Retry" onPress={() => refetch()} />
          </View>
        ) : tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText} testID="no-graphql-tasks-text">
              No GraphQL tasks available. Create one!
            </Text>
          </View>
        ) : (
          tasks.map(item => {
            const taskCategory = item.category || 'General';
            const taskPriority = item.priority || 'Normal';
            const taskTitle = item.title || 'Untitled Task';

            return (
              <View
                key={item.id}
                style={styles.taskCard}
                testID={`graphql-task-item-${item.id}`}
              >
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => handleToggle(item)}
                  testID={`toggle-task-${item.id}`}
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

                <View style={styles.taskContent}>
                  <Text
                    style={[
                      styles.taskTitle,
                      item.completed && styles.taskTitleCompleted,
                    ]}
                  >
                    {taskTitle}
                  </Text>
                  <View style={styles.tagRow}>
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagText}>{taskCategory}</Text>
                    </View>
                    <View
                      style={[
                        styles.priorityBadge,
                        getPriorityBadgeStyle(taskPriority),
                      ]}
                    >
                      <Text style={getPriorityTextStyle(taskPriority)}>
                        {taskPriority}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    onPress={() => openEditModal(item)}
                    style={styles.actionButton}
                    testID={`edit-task-${item.id}`}
                  >
                    <Text style={styles.actionIcon}>✏️</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={styles.actionButton}
                    testID={`delete-task-${item.id}`}
                  >
                    <Text style={styles.actionIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB Add Button */}
      <View style={styles.fabContainer}>
        <Button
          testID="open-add-graphql-task-modal"
          title="+ Add GraphQL Task"
          onPress={openCreateModal}
        />
      </View>

      {/* Add / Edit Task Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay} testID="graphql-task-modal">
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTask ? 'Edit GraphQL Task' : 'New GraphQL Task'}
            </Text>

            <Input
              testID="graphql-task-title-input"
              label="Title"
              placeholder="e.g. Test Swift/Kotlin Native Bridge"
              value={title}
              onChangeText={setTitle}
            />

            <Input
              testID="graphql-task-category-input"
              label="Category"
              placeholder="e.g. Native, Apollo, UI"
              value={category}
              onChangeText={setCategory}
            />

            <Text style={styles.inputLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {(['Low', 'Normal', 'High', 'Urgent'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityPill,
                    priority === p && styles.priorityPillActive,
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.priorityPillText,
                      priority === p && styles.priorityPillTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <View style={styles.modalButton}>
                <Button
                  testID="cancel-graphql-task-button"
                  title="Cancel"
                  onPress={() => {
                    setModalVisible(false);
                    setEditingTask(null);
                  }}
                />
              </View>
              <View style={styles.modalButton}>
                <Button
                  testID="save-graphql-task-button"
                  title={editingTask ? 'Update Task' : 'Save Task'}
                  onPress={handleSaveTask}
                  loading={creating || updating}
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 4,
  },
  backText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  refreshText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  nativeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  nativeCardTitle: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  nativeText: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  nativeVal: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  aiCard: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3730A3',
  },
  aiScore: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4F46E5',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aiSummary: {
    fontSize: 12,
    color: '#4338CA',
    lineHeight: 18,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#343A40',
  },
  loaderContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6C757D',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#DC3545',
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6C757D',
    fontSize: 14,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
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
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityHigh: {
    backgroundColor: '#FEE2E2',
  },
  priorityNormal: {
    backgroundColor: '#E0F2FE',
  },
  priorityLow: {
    backgroundColor: '#F3F4F6',
  },
  priorityTextHigh: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
  },
  priorityTextNormal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#075985',
  },
  priorityTextLow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
    marginLeft: 6,
  },
  actionIcon: {
    fontSize: 16,
  },
  fabContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#111827',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 6,
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priorityPill: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  priorityPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  priorityPillText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  priorityPillTextActive: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
