import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ConflictResolverManager,
  CONFLICT_AUDIT_LOG_KEY,
} from '../src/graphql/offline/ConflictResolver';
import { GraphQLTask } from '../src/graphql/schema';

describe('ConflictResolverManager', () => {
  let resolver: ConflictResolverManager;

  const serverTask: GraphQLTask = {
    __typename: 'GraphQLTask',
    id: 'task-100',
    title: 'Original Server Title',
    category: 'Work',
    priority: 'Normal',
    completed: false,
    createdAt: '2026-08-11T10:00:00.000Z',
    updatedAt: '2026-08-11T10:00:00.000Z',
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    resolver = new ConflictResolverManager();
    await resolver.clearAuditLog();
    resolver.setStrategy('FIELD_LEVEL_MERGE');
  });

  describe('Conflict Detection', () => {
    it('detects conflict when fields differ', () => {
      const hasConflict = resolver.hasConflict(
        { title: 'Device A Title' },
        serverTask,
      );
      expect(hasConflict).toBe(true);
    });

    it('returns false when local payload matches server task', () => {
      const hasConflict = resolver.hasConflict(
        {
          title: 'Original Server Title',
          category: 'Work',
          priority: 'Normal',
          completed: false,
        },
        serverTask,
      );
      expect(hasConflict).toBe(false);
    });

    it('detects conflict when server timestamp is newer than client base timestamp', () => {
      const hasConflict = resolver.hasConflict(
        { title: 'Original Server Title' },
        { ...serverTask, updatedAt: '2026-08-11T12:00:00.000Z' },
        '2026-08-11T10:00:00.000Z',
      );
      expect(hasConflict).toBe(true);
    });
  });

  describe('Conflict Strategies', () => {
    it('merges non-overlapping modified fields cleanly using FIELD_LEVEL_MERGE', () => {
      // Device A modified title, Device B on server completed the task
      const serverState: GraphQLTask = {
        ...serverTask,
        completed: true,
        updatedAt: '2026-08-11T10:05:00.000Z',
      };

      const { resolvedTask, resolvedInput } = resolver.resolveConflict(
        { title: 'Device A Title' },
        serverState,
        'FIELD_LEVEL_MERGE',
      );

      expect(resolvedInput.title).toBe('Device A Title');
      expect(resolvedInput.completed).toBe(true);
      expect(resolvedTask.title).toBe('Device A Title');
      expect(resolvedTask.completed).toBe(true);
    });

    it('applies SERVER_WINS strategy ignoring local edits', () => {
      const { resolvedTask, resolvedInput } = resolver.resolveConflict(
        { title: 'Device A Title', priority: 'Urgent' },
        serverTask,
        'SERVER_WINS',
      );

      expect(resolvedInput.title).toBe('Original Server Title');
      expect(resolvedInput.priority).toBe('Normal');
      expect(resolvedTask.title).toBe('Original Server Title');
    });

    it('applies CLIENT_WINS strategy overwriting server task', () => {
      const { resolvedTask, resolvedInput } = resolver.resolveConflict(
        { title: 'Client Wins Title', completed: true },
        serverTask,
        'CLIENT_WINS',
      );

      expect(resolvedInput.title).toBe('Client Wins Title');
      expect(resolvedInput.completed).toBe(true);
      expect(resolvedTask.title).toBe('Client Wins Title');
      expect(resolvedTask.completed).toBe(true);
    });

    it('applies LAST_WRITE_WINS based on timestamps', () => {
      const olderClientTime = '2026-08-11T09:00:00.000Z';
      const newerServerState: GraphQLTask = {
        ...serverTask,
        updatedAt: '2026-08-11T11:00:00.000Z',
      };

      const resultOlder = resolver.resolveConflict(
        { title: 'Stale Client Title' },
        newerServerState,
        'LAST_WRITE_WINS',
        olderClientTime,
      );

      // Server is newer so server wins
      expect(resultOlder.resolvedInput.title).toBe('Original Server Title');

      const newerClientTime = '2026-08-11T12:00:00.000Z';
      const resultNewer = resolver.resolveConflict(
        { title: 'Fresh Client Title' },
        newerServerState,
        'LAST_WRITE_WINS',
        newerClientTime,
      );

      // Client is newer so client wins
      expect(resultNewer.resolvedInput.title).toBe('Fresh Client Title');
    });
  });

  describe('Audit Logging', () => {
    it('records conflict resolutions in audit log and persists to storage', async () => {
      resolver.resolveConflict(
        { title: 'Conflict 1' },
        serverTask,
        'FIELD_LEVEL_MERGE',
      );

      const log = resolver.getAuditLog();
      expect(log.length).toBe(1);
      expect(log[0].taskId).toBe('task-100');
      expect(log[0].strategy).toBe('FIELD_LEVEL_MERGE');

      const storedRaw = await AsyncStorage.getItem(CONFLICT_AUDIT_LOG_KEY);
      expect(storedRaw).not.toBeNull();
      const stored = JSON.parse(storedRaw!);
      expect(stored[0].taskId).toBe('task-100');
    });

    it('clears audit log on clearAuditLog()', async () => {
      resolver.resolveConflict(
        { title: 'Conflict 1' },
        serverTask,
        'FIELD_LEVEL_MERGE',
      );
      expect(resolver.getAuditLog().length).toBe(1);

      await resolver.clearAuditLog();
      expect(resolver.getAuditLog().length).toBe(0);
    });
  });
});
