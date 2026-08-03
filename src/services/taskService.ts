import { getFirestore, collection, addDoc, updateDoc, doc, deleteDoc } from '@react-native-firebase/firestore';
import { logTaskCreated, logTaskCompleted, logTaskDeleted } from './analytics';

const db = getFirestore();

export interface Task {
  title: string;
  category?: string;
  priority?: string;
  completed?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export const taskService = {
  async addTask(task: Task) {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), task);
      await logTaskCreated({
        priority: task.priority || 'Normal',
        category: task.category || 'General',
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

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

  async deleteTask(id: string) {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      await logTaskDeleted();
    } catch (error) {
      throw error;
    }
  }
};
