import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
  getDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { getPerformance, trace } from '@react-native-firebase/perf';
import { logTaskCreated, logTaskCompleted, logTaskDeleted } from './analytics';

const db = getFirestore();

export interface Task {
  id?: string;
  title: string;
  category?: string;
  priority?: string;
  completed?: boolean;
  createdAt?: string;
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

export const taskService = {
  // CREATE
  async addTask(task: Task) {
    const addTaskTrace = trace(getPerformance(), 'custom_create_task_trace');
    await addTaskTrace.start();
    try {
      const taskData = {
        ...task,
        userId: getAuth().currentUser?.uid,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      await logTaskCreated({
        priority: task.priority || 'Normal',
        category: task.category || 'General',
      });
      await addTaskTrace.stop();
      return docRef.id;
    } catch (error) {
      await addTaskTrace.stop();
      throw error;
    }
  },

  // READ (Advanced Query with Pagination, Filtering, Search)
  async queryTasks(
    options: QueryTasksOptions = {},
  ): Promise<{ tasks: Task[]; lastVisible: any }> {
    const queryTrace = trace(getPerformance(), 'custom_query_tasks_trace');
    await queryTrace.start();
    try {
      const {
        limitTasks,
        lastDoc,
        category,
        priority,
        completed,
        searchQuery,
      } = options;

      let q = query(collection(db, 'tasks'));
      const userId = getAuth().currentUser?.uid;

      if (userId) {
        q = query(q, where('userId', '==', userId));
      }

      if (category) {
        q = query(q, where('category', '==', category));
      }
      if (priority) {
        q = query(q, where('priority', '==', priority));
      }
      if (completed !== undefined) {
        q = query(q, where('completed', '==', completed));
      }

      if (searchQuery) {
        q = query(
          q,
          where('title', '>=', searchQuery),
          where('title', '<=', searchQuery + '\uf8ff'),
        );
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      if (limitTasks) {
        q = query(q, limit(limitTasks));
      }

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const tasks: Task[] = [];

      querySnapshot.forEach(documentSnapshot => {
        tasks.push({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        } as Task);
      });

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      await queryTrace.stop();
      return { tasks, lastVisible };
    } catch (error) {
      await queryTrace.stop();
      throw error;
    }
  },

  // READ (All Tasks)
  async getTasks(): Promise<Task[]> {
    try {
      const userId = getAuth().currentUser?.uid;
      const q = userId
        ? query(collection(db, 'tasks'), where('userId', '==', userId))
        : collection(db, 'tasks');
      const querySnapshot = await getDocs(q);
      const tasks: Task[] = [];
      querySnapshot.forEach(documentSnapshot => {
        tasks.push({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        } as Task);
      });
      return tasks;
    } catch (error) {
      throw error;
    }
  },

  // READ (Single Task)
  async getTask(id: string): Promise<Task | null> {
    try {
      const docRef = doc(db, 'tasks', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() } as Task;
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE
  async updateTask(id: string, updates: Partial<Task>) {
    try {
      await updateDoc(doc(db, 'tasks', id), updates);
    } catch (error) {
      throw error;
    }
  },

  // UPDATE (Specific Complete Action)
  async completeTask(id: string, completedInMinutes?: number) {
    try {
      await updateDoc(doc(db, 'tasks', id), {
        completed: true,
      });
      await logTaskCompleted({
        completed_in: completedInMinutes || 0,
      });
    } catch (error) {
      throw error;
    }
  },

  // DELETE
  async deleteTask(id: string) {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      await logTaskDeleted();
    } catch (error) {
      throw error;
    }
  },
};
