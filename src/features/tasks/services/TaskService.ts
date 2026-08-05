import { getAuth } from '@react-native-firebase/auth';
import {
  where,
  orderBy,
  QueryConstraint,
} from '@react-native-firebase/firestore';
import { BaseFirestoreService } from '../../../core/firebase/BaseFirestoreService';
import { AnalyticsService } from '../../../core/firebase/AnalyticsCoreService';

export interface Task {
  id?: string;
  title: string;
  category?: string;
  priority?: string;
  completed?: boolean;
  createdAt?: string;
  userId?: string;
  [key: string]: any;
}

export interface QueryTasksOptions {
  limitTasks?: number;
  lastDoc?: any;
  category?: string;
  priority?: string;
  completed?: boolean;
  searchQuery?: string;
}

class TaskServiceImpl extends BaseFirestoreService<Task> {
  constructor() {
    super('tasks');
  }

  async addTask(task: Task) {
    const userId = getAuth().currentUser?.uid;
    const taskData = {
      ...task,
      userId,
    };

    const id = await this.add(taskData, 'custom_create_task_trace');

    await AnalyticsService.logTaskCreated({
      priority: task.priority || 'Normal',
      category: task.category || 'General',
    });

    return id;
  }

  async queryTasks(options: QueryTasksOptions = {}) {
    const { limitTasks, lastDoc, category, priority, completed, searchQuery } =
      options;

    const constraints: QueryConstraint[] = [];
    const userId = getAuth().currentUser?.uid;

    if (userId) {
      constraints.push(where('userId', '==', userId));
    }

    if (category) {
      constraints.push(where('category', '==', category));
    }
    if (priority) {
      constraints.push(where('priority', '==', priority));
    }
    if (completed !== undefined) {
      constraints.push(where('completed', '==', completed));
    }

    if (searchQuery) {
      constraints.push(where('title', '>=', searchQuery));
      constraints.push(where('title', '<=', searchQuery + '\uf8ff'));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    const { data, lastVisible } = await this.query(
      {
        constraints,
        limitDocs: limitTasks,
        lastDoc,
      },
      'custom_query_tasks_trace',
    );

    return { tasks: data, lastVisible };
  }

  async getTasks(): Promise<Task[]> {
    const userId = getAuth().currentUser?.uid;
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }

    const { data } = await this.query({ constraints });
    return data;
  }

  async getTask(id: string): Promise<Task | null> {
    return this.get(id);
  }

  async updateTask(id: string, updates: Partial<Task>) {
    return this.update(id, updates);
  }

  async completeTask(id: string, completedInMinutes?: number) {
    await this.update(id, { completed: true });
    await AnalyticsService.logTaskCompleted({
      completed_in: completedInMinutes || 0,
    });
  }

  async deleteTask(id: string) {
    await this.delete(id);
    await AnalyticsService.logTaskDeleted();
  }
}

export const taskService = new TaskServiceImpl();
