import { authService } from '../src/features/auth/services/AuthService';
import {
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';
import { AnalyticsService } from '../src/core/firebase/AnalyticsCoreService';
import { CrashlyticsService } from '../src/core/firebase/CrashlyticsCoreService';

// 1. Mock the underlying Firebase native modules
jest.mock('@react-native-firebase/auth', () => {
  return {
    getAuth: jest.fn(() => ({})),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  };
});

// Mock Performance Monitoring
jest.mock('@react-native-firebase/perf', () => ({
  getPerformance: jest.fn(),
  trace: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
  })),
}));

// 2. Mock our other core services that AuthService relies on
jest.mock('../src/core/firebase/AnalyticsCoreService', () => ({
  AnalyticsService: {
    logLogin: jest.fn(),
    logLogout: jest.fn(),
  },
}));

jest.mock('../src/core/firebase/CrashlyticsCoreService', () => ({
  CrashlyticsService: {
    setUser: jest.fn(),
  },
}));

// Provide empty mock for Firestore Base service so it doesn't try to load native modules
jest.mock('../src/core/firebase/BaseFirestoreService', () => {
  return {
    BaseFirestoreService: class MockBaseService {
      constructor() {}
      setUserDoc = jest.fn();
    },
  };
});

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should successfully log a user in and trigger Analytics & Crashlytics', async () => {
    // Arrange
    const mockUserCredential = { user: { uid: 'test-user-123' } };
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(
      mockUserCredential,
    );

    // Act
    const result = await authService.login('test@example.com', 'password123');

    // Assert
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(), // The 'auth' instance
      'test@example.com',
      'password123',
    );
    expect(AnalyticsService.logLogin).toHaveBeenCalledWith('email');
    expect(CrashlyticsService.setUser).toHaveBeenCalledWith('test-user-123');
    expect(result).toEqual(mockUserCredential);
  });

  it('should successfully log a user out and trigger Analytics', async () => {
    // Arrange
    (signOut as jest.Mock).mockResolvedValue(undefined);

    // Act
    await authService.logout();

    // Assert
    expect(signOut).toHaveBeenCalled();
    expect(AnalyticsService.logLogout).toHaveBeenCalled();
  });
});
