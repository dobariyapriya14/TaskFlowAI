import { MockGraphQLStore } from './store';
import { TaskInput } from '../schema';

export const createResolvers = (store: MockGraphQLStore) => ({
  tasks: (args: { category?: string; completed?: boolean }) => {
    return store.getTasks(args.category, args.completed);
  },
  tasksConnection: (args: {
    first?: number;
    after?: string;
    category?: string;
    completed?: boolean;
  }) => {
    return store.getTasksConnection(
      args.first,
      args.after,
      args.category,
      args.completed,
    );
  },
  task: (args: { id: string }) => {
    return store.getTaskById(args.id);
  },
  aiInsights: () => {
    return store.getAIInsights();
  },
  createTask: (args: { input: TaskInput }) => {
    return store.createTask(args.input);
  },
  updateTask: (args: { id: string; input: TaskInput }) => {
    return store.updateTask(args.id, args.input);
  },
  deleteTask: (args: { id: string }) => {
    return store.deleteTask(args.id);
  },
  toggleTaskCompleted: (args: { id: string }) => {
    return store.toggleTaskCompleted(args.id);
  },
});
